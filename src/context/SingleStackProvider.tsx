"use client";
import { trpc } from "@/utils/trpc";
import { useChat } from "@ai-sdk/react";
import { WebContainer, WebContainerProcess } from "@webcontainer/api";
import { ChatStatus, DefaultChatTransport } from "ai";
import { createContext, useContext, useEffect, useRef, useState } from "react";

// Ensure only a single WebContainer boot happens at a time across this module
let webContainerBootPromise: Promise<WebContainer> | null = null;
// Hold a global singleton instance to survive provider unmounts/remounts
let webContainerSingleton: WebContainer | null = null;

interface SingleStackContextType {
  webContainerInstance: WebContainer | null;
  setWebContainerInstance: (instance: WebContainer | null) => void;
  isBootingWebContainer: boolean;
  setIsBootingWebContainer: (value: boolean) => void;
  isInstallingDependencies: boolean;
  setIsInstallingDependencies: (value: boolean) => void;
  isDevServerRunning: boolean;
  setIsDevServerRunning: (value: boolean) => void;
  webPreviewUrl: string | null;
  setWebPreviewUrl: (url: string | null) => void;
  messages: any;
  sendMessage: any;
  setMessages: any;
  mountAndRun: (
    files: any,
    webContainerInstance: WebContainer
  ) => Promise<void>;
  stackDetails: any;
  activeTab: "code-editor" | "web-preview";
  setActiveTab: (tab: "code-editor" | "web-preview") => void;
  webContainerPort: number | null;
  setWebContainerPort: (port: number | null) => void;
  selectedFile: any;
  setSelectedFile: (file: any) => void;
  onResponseFinish: boolean;
  setOnResponseFinish: (value: boolean) => void;
  mountFiles: (files: any, webContainerInstance: WebContainer) => Promise<void>;
  bootWebContainer: () => Promise<WebContainer>;
  registerTerminal: (write: (text: string) => void) => void;
  unregisterTerminal: () => void;
  streamingStatus: ChatStatus;
  stopStreaming: () => void;
  updateFile: (filePath: string, newContent: string) => Promise<any>;
  webContainerFiles: any;
}

interface SingleStackProviderProps {
  children: React.ReactNode;
  stackId: string;
}

const SingleStackContext = createContext<SingleStackContextType | null>(null);

export const useSingleStack = () => {
  const context = useContext(SingleStackContext);
  if (!context) {
    throw new Error("useSingleStack must be used within a SingleStackProvider");
  }
  return context;
};

export default function SingleStackProvider({
  children,
  stackId,
}: SingleStackProviderProps) {
  const [webContainerInstance, setWebContainerInstance] =
    useState<WebContainer | null>(null);
  const [isBootingWebContainer, setIsBootingWebContainer] = useState(false);
  const [isInstallingDependencies, setIsInstallingDependencies] =
    useState(false);
  const [isDevServerRunning, setIsDevServerRunning] = useState(false);
  const [webPreviewUrl, setWebPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"code-editor" | "web-preview">(
    "web-preview"
  );
  const [webContainerPort, setWebContainerPort] = useState<number | null>(null);
  const { data: stackDetails, isLoading: stackLoading } =
    trpc.getStackDetails.useQuery({
      stackId,
    });
  const { mutateAsync: createMessage } = trpc.createMessage.useMutation();
  const { mutateAsync: updateStack } = trpc.updateStack.useMutation();
  const utils = trpc.useUtils();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [onResponseFinish, setOnResponseFinish] = useState(false);
  const [webContainerFiles, setWebContainerFiles] = useState<any>({});
  const devServerProcessRef = useRef<WebContainerProcess | null>(null);
  const runningProcessesRef = useRef<WebContainerProcess[]>([]);
  const terminalWriteRef = useRef<((text: string) => void) | null>(null);

  function registerTerminal(write: (text: string) => void) {
    terminalWriteRef.current = write;
  }

  function unregisterTerminal() {
    terminalWriteRef.current = null;
  }

  const {
    messages,
    sendMessage,
    setMessages,
    status: streamingStatus,
    stop: stopStreaming,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onFinish: (data) => {
      if (stackId) {
        createMessage({
          stackId: stackId,
          parts: data.message.parts,
          role: data.message.role,
        });
      }
      setOnResponseFinish(true);
    },
  });

  async function bootWebContainer(): Promise<WebContainer> {
    // Reuse global singleton if available
    if (webContainerSingleton) {
      if (!webContainerInstance) {
        setWebContainerInstance(webContainerSingleton);
      }
      terminalWriteRef.current?.("Using existing WebContainer instance\r\n");
      return webContainerSingleton;
    }

    // Fallback to local state if already set
    if (webContainerInstance) {
      terminalWriteRef.current?.("Using existing WebContainer instance\r\n");
      return webContainerInstance;
    }

    if (webContainerBootPromise) {
      setIsBootingWebContainer(true);
      const instance = await webContainerBootPromise;
      webContainerSingleton = instance;
      setWebContainerInstance(webContainerSingleton);
      setIsBootingWebContainer(false);
      return webContainerSingleton;
    }

    try {
      setIsBootingWebContainer(true);
      console.log("Booting web container", stackId);
      terminalWriteRef.current?.("Booting WebContainer...\r\n");
      webContainerBootPromise = WebContainer.boot();
      const instance = await webContainerBootPromise;
      webContainerSingleton = instance;
      setWebContainerInstance(webContainerSingleton);
      terminalWriteRef.current?.("WebContainer ready.\r\n");
      return webContainerSingleton;
    } finally {
      setIsBootingWebContainer(false);
      webContainerBootPromise = null;
    }
  }

  async function startDevServer(webContainerInstance: WebContainer) {
    if (!webContainerInstance) return;

    // If server is already running, do nothing
    if (
      isDevServerRunning ||
      devServerProcessRef.current ||
      webPreviewUrl ||
      webContainerPort
    ) {
      return;
    }

    // `npm run dev`
    const devProcess = await webContainerInstance.spawn("npm", ["run", "dev"]);
    devServerProcessRef.current = devProcess;
    setIsDevServerRunning(true);

    // Pipe dev server output to terminal
    try {
      devProcess.output.pipeTo(
        new WritableStream<string>({
          write(data: string) {
            terminalWriteRef.current?.(data.replace(/\n/g, "\r\n"));
          },
        })
      );
    } catch {
      // ignore
    }

    // Clear ref when process exits
    devProcess.exit
      .then(() => {
        if (devServerProcessRef.current === devProcess) {
          devServerProcessRef.current = null;
        }
        setIsDevServerRunning(false);
        terminalWriteRef.current?.("Dev server stopped.\r\n");
      })
      .catch(() => {
        // Ignore
      });

    webContainerInstance.on("server-ready", (port, url) => {
      setWebContainerPort(port);
      setWebPreviewUrl(url);
      console.log(url);
      terminalWriteRef.current?.(
        `Dev server ready on port ${port}. Preview: ${url}\r\n`
      );
    });
  }

  async function installDependencies(webContainerInstance: WebContainer) {
    setIsInstallingDependencies(true);
    // Install dependencies
    console.log("Installing dependencies", stackId);
    terminalWriteRef.current?.("Installing dependencies...\r\n");
    const installProcess = await webContainerInstance.spawn("npm", ["install"]);
    runningProcessesRef.current = [
      ...runningProcessesRef.current,
      installProcess,
    ];

    try {
      installProcess.output.pipeTo(
        new WritableStream<string>({
          write(data: string) {
            terminalWriteRef.current?.(data.replace(/\n/g, "\r\n"));
          },
        })
      );
    } catch {
      // ignore
    }
    // Wait for install command to exit
    const exitPromise = installProcess.exit.finally(() => {
      runningProcessesRef.current = runningProcessesRef.current.filter(
        (p) => p !== installProcess
      );
    });

    return exitPromise;
  }

  // Deep merge function for files
  const deepMerge = (target: any, source: any) => {
    const result = { ...target };
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  };

  // Function to update a single file and merge with existing files
  async function updateFile(filePath: string, newContent: string) {
    const currentFiles: any = (stackDetails as any)?.stack?.files;
    if (!currentFiles) return;

    // Create the new file structure
    const pathParts = filePath.split("/");
    let newFileStructure: Record<string, any> = {};
    let currentLevel = newFileStructure;

    // Build the nested structure
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];

      if (i === pathParts.length - 1) {
        // This is the file (last part)
        currentLevel[part] = {
          file: {
            contents: newContent,
          },
        };
      } else {
        // This is a directory
        currentLevel[part] = {
          directory: {},
        };
        currentLevel = currentLevel[part].directory;
      }
    }

    // Deep merge with existing files
    const mergedFiles = deepMerge(currentFiles, newFileStructure);

    // Update the database
    await updateStack({
      stackId: stackId,
      files: mergedFiles,
    });

    // Invalidate and refetch stack details
    utils.getStackDetails.invalidate({ stackId });

    // Update WebContainer if running
    if (webContainerInstance) {
      await mountFiles(mergedFiles, webContainerInstance);
    }

    return mergedFiles;
  }

  async function mountFiles(files: any, webContainerInstance: WebContainer) {
    if (!webContainerInstance) return;
    console.log("Mount Files");
    terminalWriteRef.current?.("Mounting files...\r\n");

    await webContainerInstance.mount(files);
    terminalWriteRef.current?.("Files mounted.\r\n");
  }

  async function mountAndRun(files: any, webContainerInstance: WebContainer) {
    if (!webContainerInstance) return;
    console.log("Mount And Run");
    terminalWriteRef.current?.("Starting stack: mount → install → dev\r\n");
    await mountFiles(files, webContainerInstance);
    setIsInstallingDependencies(true);
    await installDependencies(webContainerInstance);
    await startDevServer(webContainerInstance);
    setIsInstallingDependencies(false);

    // Don't set isDevServerRunning to false - the server is now running
  }

  useEffect(() => {
    console.log(stackId);
  }, [stackId]);

  // Function to recursively read the entire file tree from WebContainer
  async function getFileTree(
    webContainerInstance: WebContainer,
    path: string = "/"
  ): Promise<any> {
    if (!webContainerInstance) return {};

    try {
      const entries = await webContainerInstance.fs.readdir(path);

      const result: any = {};

      for (const entryName of entries) {
        const fullPath =
          path === "/" ? `/${entryName}` : `${path}/${entryName}`;

        try {
          // Try to readdir to check if it's a directory
          // If readdir succeeds, it's a directory; if it fails, it's likely a file
          await webContainerInstance.fs.readdir(fullPath);

          // It's a directory - recursively read directory contents
          const directoryContents = await getFileTree(
            webContainerInstance,
            fullPath
          );
          result[entryName] = {
            directory: directoryContents,
          };
        } catch (dirError) {
          // If readdir fails, it's likely a file - try to read it
          try {
            const contents = await webContainerInstance.fs.readFile(
              fullPath,
              "utf-8"
            );
            result[entryName] = {
              file: {
                contents: contents,
              },
            };
          } catch (readError) {
            // If file can't be read (e.g., binary), include it with empty contents
            console.warn(`Could not read file ${fullPath}:`, readError);
            result[entryName] = {
              file: {
                contents: "",
              },
            };
          }
        }
      }

      return result;
    } catch (error) {
      console.error(`Error reading directory ${path}:`, error);
      return {};
    }
  }

  useEffect(() => {
    if (!webContainerInstance) return;

    let isActive = true;

    // Initial file tree read
    getFileTree(webContainerInstance, "/").then((fileTree) => {
      if (isActive) {
        console.log("webContainerFiles (initial)", fileTree);
        setWebContainerFiles(fileTree);
      }
    });

    // Set up file watcher to detect changes
    // The watch method accepts a callback and returns an IFSWatcher with a close() method
    const watcher = webContainerInstance.fs.watch("/", (event) => {
      if (!isActive) return;
      // Re-read the file tree when any file changes
      getFileTree(webContainerInstance, "/").then((fileTree) => {
        if (isActive) {
          console.log("webContainerFiles (updated)", fileTree, event);
          setWebContainerFiles(fileTree);
        }
      });
    });

    // Cleanup: close the watcher when component unmounts or webContainerInstance changes
    return () => {
      isActive = false;
      watcher.close();
    };
  }, [webContainerInstance]);

  // Cleanup when stackId changes or when provider unmounts
  useEffect(() => {
    return () => {
      // Kill any running processes (dev server, installs, etc.)
      try {
        devServerProcessRef.current?.kill();
      } catch (error) {
        console.warn("Error killing dev server process", error);
      } finally {
        devServerProcessRef.current = null;
      }

      try {
        for (const process of runningProcessesRef.current) {
          try {
            process.kill();
          } catch {
            // ignore
          }
        }
      } finally {
        runningProcessesRef.current = [];
      }

      // Teardown the container and reset globals
      const instanceToTearDown = webContainerSingleton || webContainerInstance;
      if (instanceToTearDown) {
        try {
          instanceToTearDown.teardown();
        } catch (error) {
          console.warn("Error tearing down WebContainer", error);
        }
      }
      webContainerSingleton = null;
      webContainerBootPromise = null;

      // Reset local state
      setWebContainerInstance(null);
      setIsDevServerRunning(false);
      setIsInstallingDependencies(false);
      setWebPreviewUrl(null);
      setWebContainerPort(null);
      terminalWriteRef.current?.("WebContainer torn down.\r\n");
    };
  }, [stackId]);

  return (
    <SingleStackContext.Provider
      value={{
        webContainerInstance,
        setWebContainerInstance,
        isBootingWebContainer,
        setIsBootingWebContainer,
        isInstallingDependencies,
        setIsInstallingDependencies,
        isDevServerRunning,
        setIsDevServerRunning,
        webPreviewUrl,
        setWebPreviewUrl,
        messages,
        sendMessage,
        setMessages,
        mountAndRun,
        stackDetails,
        activeTab,
        setActiveTab,
        webContainerPort,
        setWebContainerPort,
        selectedFile,
        setSelectedFile,
        onResponseFinish,
        setOnResponseFinish,
        mountFiles,
        bootWebContainer,
        registerTerminal,
        unregisterTerminal,
        streamingStatus,
        stopStreaming,
        updateFile,
        webContainerFiles,
      }}
    >
      {children}
    </SingleStackContext.Provider>
  );
}
