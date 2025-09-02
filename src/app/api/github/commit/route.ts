import { checkUser } from "@/lib/checkUser";
import { prisma } from "@/lib/prisma";
import { treeToTemplate } from "@/utils/converter";
import { Octokit } from "@octokit/rest";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Commit and push the current stack files to the linked GitHub repo
    const { commitMessage, stackId } = await request.json();
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

    if (!stack.githubRepoId) {
      return NextResponse.json(
        { error: "No GitHub repository linked to this stack" },
        { status: 400 }
      );
    }

    const octokit = new Octokit({ auth: accessToken });

    // Get repo details by id to retrieve owner login, name, and default branch
    const { data: repo } = await octokit.request(
      "GET /repositories/{repository_id}",
      {
        repository_id: Number(stack.githubRepoId),
      }
    );

    const owner = repo.owner?.login as string;
    const repoName = repo.name;
    const defaultBranch = repo.default_branch;

    // Get the latest commit on the default branch
    const currentRef = await octokit.git.getRef({
      owner,
      repo: repoName,
      ref: `heads/${defaultBranch}`,
    });
    const latestCommitSha = currentRef.data.object.sha;

    // Get the tree for the latest commit
    const latestCommit = await octokit.git.getCommit({
      owner,
      repo: repoName,
      commit_sha: latestCommitSha,
    });

    const baseTreeSha = latestCommit.data.tree.sha;

    // Flatten stack files to a template map
    const directoryTree = (stack.files || {}) as any;
    const flatFiles = treeToTemplate(directoryTree);

    // Build the tree entries
    const tree = Object.entries(flatFiles).map(([path, contents]) => ({
      path,
      mode: "100644" as const,
      type: "blob" as const,
      content: String(contents ?? ""),
    }));

    // Create a new tree based on the base tree
    const createdTree = await octokit.git.createTree({
      owner,
      repo: repoName,
      base_tree: baseTreeSha,
      tree,
    });

    // Create a commit
    const commit = await octokit.git.createCommit({
      owner,
      repo: repoName,
      message: commitMessage || "Update from Stack",
      tree: createdTree.data.sha,
      parents: [latestCommitSha],
    });

    // Update the reference to point to the new commit
    await octokit.git.updateRef({
      owner,
      repo: repoName,
      ref: `heads/${defaultBranch}`,
      sha: commit.data.sha,
      force: true,
    });

    return NextResponse.json({ success: true, commitSha: commit.data.sha });
  } catch (error) {
    console.error("Error in GitHub commit:", error);
    return NextResponse.json(
      { error: "Failed to commit to GitHub repository" },
      { status: 500 }
    );
  }
}
