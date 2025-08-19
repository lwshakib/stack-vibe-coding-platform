import { checkUser } from "@/lib/checkUser";
import { prisma } from "@/lib/prisma";
import { Octokit } from "@octokit/rest";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("github_access_token")?.value;
  if (!accessToken) {
    return NextResponse.json(
      { error: "No access token found" },
      { status: 401 }
    );
  }
  const octokit = new Octokit({ auth: accessToken });

  const { searchParams } = new URL(request.url);
  const stackId = searchParams.get("stackId");

  if (!stackId) {
    // OAuth connected, but no specific stack requested
    return NextResponse.json({ repo: null });
  }

  const user = await checkUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stack = await prisma.stack.findFirst({
    where: { id: stackId, clerkId: user.clerkId },
  });
  if (!stack) {
    return NextResponse.json({ error: "Stack not found" }, { status: 404 });
  }

  if (!stack.githubRepoId) {
    return NextResponse.json({ repo: null });
  }

  // Fetch repo details by repository id
  const repoById = await octokit.request("GET /repositories/{repository_id}", {
    repository_id: Number(stack.githubRepoId),
  });

  return NextResponse.json({ repo: repoById.data });
}

export async function POST(request: NextRequest) {
  const { action, ...data } = await request.json();

  if (action === "createRepo") {
    // Create a repo and save it to the stack
    const { repoName, repoDescription, repoVisibility, stackId } = data;
    const accessToken = request.cookies.get("github_access_token")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }
    if (!stackId) {
      return NextResponse.json({ error: "Missing stackId" }, { status: 400 });
    }

    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stack = await prisma.stack.findFirst({
      where: { id: stackId, clerkId: user.clerkId },
    });
    if (!stack) {
      return NextResponse.json({ error: "Stack not found" }, { status: 404 });
    }

    const octokit = new Octokit({ auth: accessToken });
    const { data: repo } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description: repoDescription,
      private: repoVisibility === "private",
      auto_init: true,
      license_template: "mit",
    });

    await prisma.stack.update({
      where: { id: stack.id },
      data: {
        githubRepoId: String(repo.id),
        githubOwnerId: String(repo.owner?.id ?? ""),
      },
    });

    return NextResponse.json({ repo });
  } else if (action === "generateReadme") {
    // Generate README using AI
    const { stackId, repoName, repoUrl } = data;
    const accessToken = request.cookies.get("github_access_token")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }
    if (!stackId) {
      return NextResponse.json({ error: "Missing stackId" }, { status: 400 });
    }

    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stack = await prisma.stack.findFirst({
      where: { id: stackId, clerkId: user.clerkId },
    });
    if (!stack) {
      return NextResponse.json({ error: "Stack not found" }, { status: 404 });
    }

    // Import AI SDK dynamically to avoid issues
    const { generateText } = await import("ai");
    const { getGeminiModel } = await import("@/llm/model");

    const systemPrompt = `You are an expert technical writer. Create a comprehensive, professional README.md file for a software project.

The README should include:
1. Project title and description
2. Features and capabilities
3. Installation instructions
4. Usage examples
5. Technology stack and dependencies
6. Project structure overview
7. Contributing guidelines
8. License information
9. Links to the repository and any relevant resources

Make it detailed, well-structured, and professional. Use proper markdown formatting with headers, code blocks, lists, and tables where appropriate.

Repository Information:
- Name: ${repoName || "Project"}
- URL: ${repoUrl || "N/A"}

Project Files Structure:
${JSON.stringify(stack.files || {}, null, 2)}

Generate only the README content without any explanations or additional text.`;

    try {
      const response = await generateText({
        model: getGeminiModel(),
        system: systemPrompt,
        prompt:
          "Generate a comprehensive README.md file for this project based on the file structure and repository information provided.",
      });

      return NextResponse.json({ readme: response.text });
    } catch (error) {
      console.error("Error generating README:", error);
      return NextResponse.json(
        { error: "Failed to generate README" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("github_access_token");
  return NextResponse.json({ message: "GitHub removed from your account" });
}

export async function PATCH(request: NextRequest) {
  // Remove the repo from the stack (unlink)
  const { stackId } = await request.json();
  if (!stackId) {
    return NextResponse.json({ error: "Missing stackId" }, { status: 400 });
  }

  const user = await checkUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stack = await prisma.stack.findFirst({
    where: { id: stackId, clerkId: user.clerkId },
  });
  if (!stack) {
    return NextResponse.json({ error: "Stack not found" }, { status: 404 });
  }

  await prisma.stack.update({
    where: { id: stack.id },
    data: { githubRepoId: null, githubOwnerId: null },
  });

  return NextResponse.json({ message: "Repository unlinked from stack" });
}
