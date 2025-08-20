interface FileLeaf {
  file: { contents: string };
}
interface DirectoryNode {
  directory: Record<string, FileNode>;
}
type FileNode = FileLeaf | DirectoryNode;

interface FileProgress {
  fullPath: string;
  status: "PROCESSING" | "COMPLETED";
}

interface ParsedStackArtifact {
  introduction: string;
  files: {
    title: string;
    files: Record<string, FileNode>;
  };
  progress: {
    files: FileProgress[];
  };
  conclusion: string;
}

function isDirectoryNode(node: FileNode): node is DirectoryNode {
  return (node as DirectoryNode).directory !== undefined;
}

function parseStackArtifact(input: string): ParsedStackArtifact {
  const result: ParsedStackArtifact = {
    introduction: "",
    files: {
      title: "",
      files: {},
    },
    progress: {
      files: [],
    },
    conclusion: "",
  };

  // Extract introduction (text before <stackArtifact>)
  const introMatch = input.match(/^[\s\S]*?(?=<stackArtifact)/);
  result.introduction = introMatch ? introMatch[0].trim() : "";

  // Extract artifact title - more flexible matching for streaming
  const titleMatch = input.match(/<stackArtifact[^>]*title="([^"]+)"/);
  const artifactTitle = titleMatch ? titleMatch[1] : "";

  // Extract conclusion (text after </stackArtifact>)
  const conclusionMatch = input.match(/(?<=<\/stackArtifact>)[\s\S]*$/);
  result.conclusion = conclusionMatch ? conclusionMatch[0].trim() : "";

  result.files.title = artifactTitle;

  // Track progress for each file
  const fileProgressMap = new Map<string, FileProgress>();

  // More flexible file matching for streaming content
  // Look for stackAction tags even if they're incomplete
  const fileRegex =
    /<stackAction[^>]*filePath="([^"]+)"[^>]*>([\s\S]*?)(?=<stackAction|<\/stackAction>|$)/g;
  let match: RegExpExecArray | null;

  while ((match = fileRegex.exec(input)) !== null) {
    const filePath = match[1];
    let fileContent = match[2].trim();

    // Check if this file has a complete end tag by looking for the specific closing tag
    // We need to find the closing tag that corresponds to this specific file
    const fileStartIndex = match.index;
    const fileEndIndex = fileStartIndex + match[0].length;

    // Look for the closing tag after this file's content
    const remainingText = input.substring(fileEndIndex);
    const hasEndTag = remainingText.includes("</stackAction>");

    // A file is considered complete if it has content and we can see a closing tag
    const isComplete = hasEndTag && fileContent.length > 0;

    // Update or create progress entry
    const progress: FileProgress = {
      fullPath: filePath,
      status: isComplete ? "COMPLETED" : "PROCESSING",
    };

    fileProgressMap.set(filePath, progress);

    // If content ends abruptly, that's okay for streaming
    // Remove any trailing incomplete tags or content
    fileContent = fileContent.replace(/<[^>]*$/, "").trim();

    // Split into directory structure
    const parts = filePath.split("/");
    let current: Record<string, FileNode> = result.files.files;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        current[part] = { file: { contents: fileContent } };
      } else {
        if (!current[part]) current[part] = { directory: {} };
        const next = current[part];
        if (!isDirectoryNode(next)) {
          current[part] = { directory: {} };
        }
        current = (current[part] as DirectoryNode).directory;
      }
    }
  }

  // Convert progress map to array
  result.progress.files = Array.from(fileProgressMap.values());

  return result;
}

export default parseStackArtifact;

// Test function to demonstrate streaming parsing
export function testStreamingParser() {
  // Test incomplete streaming input
  const streamingInput = `Certainly I will create a todo app using Expo. \`\`\`html <stackArtifact id="expo-todo-app" title="Expo Todo App"> <stackAction type="file" filePath="package.json"> { "name": "bolt-expo-starter", "main": "expo-router/entry", "version": "1.0.0", "private"`;

  const result = parseStackArtifact(streamingInput);
  console.log("Incomplete streaming result:");
  console.log(JSON.stringify(result, null, 2));

  // Test complete input
  const completeInput = `Certainly I will create a todo app using Expo. \`\`\`html <stackArtifact id="expo-todo-app" title="Expo Todo App"> <stackAction type="file" filePath="package.json"> { "name": "bolt-expo-starter", "main": "expo-router/entry", "version": "1.0.0", "private": true } </stackAction> <stackAction type="file" filePath="app/page.tsx"> import React from 'react'; export default function Page() { return <div>Hello World</div>; } </stackAction> </stackArtifact> Your todo app is now ready! You can run it using 'npx expo start'.`;

  const completeResult = parseStackArtifact(completeInput);
  console.log("\nComplete input result:");
  console.log(JSON.stringify(completeResult, null, 2));

  return { incomplete: result, complete: completeResult };
}

// Test progress tracking specifically
export function testProgressTracking() {
  console.log("Testing Progress Tracking:");

  // Test 1: Single incomplete file
  const test1 = parseStackArtifact(
    `<stackArtifact title="Test"> <stackAction filePath="app/page.tsx"> import React`
  );
  console.log("\n1. Single incomplete file:");
  console.log("Progress:", test1.progress);

  // Test 2: Single complete file
  const test2 = parseStackArtifact(
    `<stackArtifact title="Test"> <stackAction filePath="app/page.tsx"> import React </stackAction>`
  );
  console.log("\n2. Single complete file:");
  console.log("Progress:", test2.progress);

  // Test 3: Multiple files with mixed completion
  const test3 = parseStackArtifact(
    `<stackArtifact title="Test"> <stackAction filePath="app/page.tsx"> import React </stackAction> <stackAction filePath="app/layout.tsx"> import React from 'react'`
  );
  console.log("\n3. Multiple files with mixed completion:");
  console.log("Progress:", test3.progress);

  return { test1, test2, test3 };
}
