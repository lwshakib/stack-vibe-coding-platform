import { checkUser } from "@/lib/checkUser";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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

  try {
    // Import JSZip dynamically to avoid build issues
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    // Function to recursively add files to ZIP
    const addFilesToZip = (files: any, currentPath: string = "") => {
      for (const [name, node] of Object.entries(files)) {
        const fullPath = currentPath ? `${currentPath}/${name}` : name;

        if ("file" in node) {
          // It's a file node
          zip.file(fullPath, node.file.contents || "");
        } else if ("directory" in node) {
          // It's a directory node, recursively traverse
          addFilesToZip(node.directory, fullPath);
        }
      }
    };

    // Add all files to the ZIP
    if (stack.files) {
      addFilesToZip(stack.files);
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // Create response with ZIP file
    const response = new NextResponse(zipBuffer);
    response.headers.set("Content-Type", "application/zip");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${stack.name || "project"}.zip"`
    );

    return response;
  } catch (error) {
    console.error("Error creating ZIP:", error);
    return NextResponse.json(
      { error: "Failed to create ZIP file" },
      { status: 500 }
    );
  }
}
