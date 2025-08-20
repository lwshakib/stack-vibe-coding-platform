export const filterIgnoredFiles = (files: any): any => {
    if (!files || typeof files !== "object") return files;
  
    // First, extract ignore patterns from .stack file
    const ignorePatterns: string[] = [];
    if (
      files[".stack"] &&
      files[".stack"].directory &&
      files[".stack"].directory.ignore
    ) {
      const ignoreFile = files[".stack"].directory.ignore.file;
      if (ignoreFile && ignoreFile.contents) {
        ignorePatterns.push(
          ...ignoreFile.contents.split("\n").filter((line: string) => line.trim())
        );
      }
    }
  
    // Helper function to check if a path should be ignored
    const shouldIgnore = (path: string): boolean => {
      // Always ignore these common config files
      const alwaysIgnored = [
        "package-lock.json",
        "tsconfig.json",
        "components.json",
        ".npmrc",
        ".gitignore",
        ".prettierrc",
      ];
      if (alwaysIgnored.includes(path)) {
        return true;
      }
  
      // Ignore image files
      if (path.match(/\.(png|jpg|jpeg|svg)$/i)) {
        return true;
      }
  
      // Ignore assets and public folders completely
      if (
        path.startsWith("assets/") ||
        path.startsWith("public/") ||
        path === "assets" ||
        path === "public"
      ) {
        return true;
      }
  
      return ignorePatterns.some((pattern) => {
        // Handle wildcard patterns like "src/*"
        if (pattern.includes("*")) {
          const regexPattern = pattern.replace(/\*/g, ".*");
          return new RegExp(`^${regexPattern}$`).test(path);
        }
        // Handle exact path matches
        return path === pattern;
      });
    };
  
    // Helper function to filter files recursively
    const filterFilesRecursive = (
      filesObj: any,
      currentPath: string = ""
    ): any => {
      if (!filesObj || typeof filesObj !== "object") return filesObj;
  
      const filtered: any = {};
  
      for (const [key, value] of Object.entries(filesObj)) {
        // Skip .stack directory from output
        if (key === ".stack") continue;
  
        const fullPath = currentPath ? `${currentPath}/${key}` : key;
  
        // Check if this path should be ignored
        if (shouldIgnore(fullPath)) {
          continue; // Skip this file/directory
        }
  
        if (typeof value === "object" && value !== null) {
          if (
            (value as any).directory &&
            typeof (value as any).directory === "object"
          ) {
            // It's a directory, filter its contents
            const filteredContents = filterFilesRecursive(
              (value as any).directory,
              fullPath
            );
            if (Object.keys(filteredContents).length > 0) {
              filtered[key] = { directory: filteredContents };
            }
          } else {
            // It's a file or other object
            filtered[key] = value;
          }
        } else {
          filtered[key] = value;
        }
      }
  
      return filtered;
    };
  
    return filterFilesRecursive(files);
  };
  