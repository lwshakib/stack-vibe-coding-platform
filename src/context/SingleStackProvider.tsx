"use client";
import { trpc } from "@/utils/trpc";
import { useChat } from "@ai-sdk/react";
import { WebContainer } from "@webcontainer/api";
import { DefaultChatTransport } from "ai";
import { createContext, useContext, useEffect, useState } from "react";

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
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [onResponseFinish, setOnResponseFinish] = useState(false);

  const { messages, sendMessage, setMessages } = useChat({
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
      return webContainerSingleton;
    }

    // Fallback to local state if already set
    if (webContainerInstance) {
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
      webContainerBootPromise = WebContainer.boot();
      const instance = await webContainerBootPromise;
      webContainerSingleton = instance;
      setWebContainerInstance(webContainerSingleton);
      return webContainerSingleton;
    } finally {
      setIsBootingWebContainer(false);
      webContainerBootPromise = null;
    }
  }

  async function startDevServer(webContainerInstance: WebContainer) {
    if (!webContainerInstance) return;

    // `npm run dev`
    await webContainerInstance.spawn("npm", ["run", "dev"]);

    webContainerInstance.on("server-ready", (port, url) => {
      setWebContainerPort(port);
      setWebPreviewUrl(url);
      console.log(url);
    });
  }

  async function installDependencies(webContainerInstance: WebContainer) {
    setIsInstallingDependencies(true);
    // Install dependencies
    console.log("Installing dependencies", stackId);
    const installProcess = await webContainerInstance.spawn("npm", ["install"]);

    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data.toString());
        },
      })
    );
    // Wait for install command to exit

    return installProcess.exit;
  }

  async function mountFiles(files: any, webContainerInstance: WebContainer) {
    if (!webContainerInstance) return;
    console.log("Mount Files");

    await webContainerInstance.mount(files);
  }

  async function mountAndRun(files: any, webContainerInstance: WebContainer) {
    if (!webContainerInstance) return;
    console.log("Mount And Run");
    await mountFiles(files, webContainerInstance);
    setIsInstallingDependencies(true);
    setIsDevServerRunning(true);
    await installDependencies(webContainerInstance);
    await startDevServer(webContainerInstance);
    setIsInstallingDependencies(false);

    // Don't set isDevServerRunning to false - the server is now running
  }

  useEffect(() => {
    console.log(stackId);
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
      }}
    >
      {children}
    </SingleStackContext.Provider>
  );
}
