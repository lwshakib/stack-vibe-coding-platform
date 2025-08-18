type BinaryFile = { binary: string };
type TemplateFileValue = string | BinaryFile | unknown;
type TemplateFiles = Record<string, TemplateFileValue>;

interface TemplateData {
  template: {
    files: TemplateFiles;
  };
}

type FileNode = { file: { contents: string } };
type DirectoryNode = { directory: DirectoryMap };
type TreeNode = FileNode | DirectoryNode;
type DirectoryMap = Record<string, TreeNode>;

export function templateToTree(templateData: TemplateData): DirectoryMap {
  function buildTree(files: TemplateFiles): DirectoryMap {
    const tree: DirectoryMap = {};
    for (const [filePath, content] of Object.entries(files)) {
      const parts = filePath.split("/");
      let current: DirectoryMap = tree;

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          let textContents: string;
          if (typeof content === "string") {
            textContents = content;
          } else if (
            content &&
            typeof content === "object" &&
            Object.prototype.hasOwnProperty.call(content as object, "binary")
          ) {
            // Some templates represent binary assets as { binary: "..." }
            // Store the binary string so the UI can decide how to render it
            textContents = (content as BinaryFile).binary;
          } else {
            // Fallback: make it visible rather than crashing
            try {
              textContents = JSON.stringify(content, null, 2);
            } catch {
              textContents = String(content);
            }
          }

          current[part] = { file: { contents: textContents } };
        } else {
          if (!current[part] || !("directory" in current[part])) {
            current[part] = { directory: {} };
          }
          current = (current[part] as DirectoryNode).directory;
        }
      });
    }
    return tree;
  }

  return buildTree(templateData.template.files);
}

export function treeToTemplate(tree: DirectoryMap): TemplateFiles {
  const files: TemplateFiles = {};

  function traverseDirectory(dir: DirectoryMap, currentPath: string = "") {
    for (const [name, node] of Object.entries(dir)) {
      const fullPath = currentPath ? `${currentPath}/${name}` : name;

      if ("file" in node) {
        // It's a file node
        files[fullPath] = node.file.contents;
      } else if ("directory" in node) {
        // It's a directory node, recursively traverse
        traverseDirectory(node.directory, fullPath);
      }
    }
  }

  traverseDirectory(tree);
  return files;
}
