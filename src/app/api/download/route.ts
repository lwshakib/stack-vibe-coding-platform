import { checkUser } from "@/lib/checkUser";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Define types for the file structure
interface FileNode {
  file: {
    contents: string;
  };
}

interface DirectoryNode {
  directory: Record<string, FileNode | DirectoryNode>;
}

type FileSystemNode = FileNode | DirectoryNode;

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
    const addFilesToZip = (
      files: Record<string, FileSystemNode>,
      currentPath: string = ""
    ) => {
      for (const [name, node] of Object.entries(files)) {
        const fullPath = currentPath ? `${currentPath}/${name}` : name;

        if (node && typeof node === "object" && "file" in node) {
          // It's a file node
          const fileNode = node as FileNode;
          zip.file(fullPath, fileNode.file.contents || "");
        } else if (node && typeof node === "object" && "directory" in node) {
          // It's a directory node, recursively traverse
          const dirNode = node as DirectoryNode;
          addFilesToZip(dirNode.directory, fullPath);
        }
      }
    };

    // Add all files to the ZIP
    if (
      stack.files &&
      typeof stack.files === "object" &&
      !Array.isArray(stack.files)
    ) {
      addFilesToZip(stack.files as unknown as Record<string, FileSystemNode>);
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // Create response with ZIP file
    const response = new NextResponse(new Uint8Array(zipBuffer));
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
