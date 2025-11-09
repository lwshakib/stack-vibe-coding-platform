"use client";
import { useSingleStack } from "@/context/SingleStackProvider";
import { useStack } from "@/context/StackProvider";
import { treeToTemplate } from "@/utils/converter";
import { filterIgnoredFiles } from "@/utils/helpers";
import { trpc } from "@/utils/trpc";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import LeftSideView from "../_components/LeftSideView";
import RightSideView from "../_components/RightSideView";
import TopView from "../_components/TopView";

export default function page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { mutateAsync: getTemplateTrpc } = trpc.getTemplate.useMutation();
  const { mutateAsync: updateTemplate } = trpc.updateStack.useMutation();
  const { mutateAsync: createMessage } = trpc.createMessage.useMutation();
  const {
    messages,
    sendMessage,
    setMessages,
    webContainerInstance,
    mountAndRun,
    stackDetails,
    bootWebContainer,
  } = useSingleStack();

  const { files, setFiles } = useStack();
  const utils = trpc.useUtils();

  const hasRequestedRef = useRef(false);
  const hasBootedRef = useRef(false);

  async function sendMessageFirstTime(message: string) {
    if (!params.id) return;
    setMessages([
      {
          "id": "dummy-message",
          "parts": [
              {
                  "text": message,
                  "type": "text"
              }
          ],
          "role": "user",
      }
  ]);


    const template = await getTemplateTrpc({ message });
    if (!template.files) {
      toast.error(template.reason);
      return;
    }
    await updateTemplate({
      files: template.files,
      template: template.template,
      stackId: params.id.toString(),
      name: template.updatedStackName,
    });

    utils.getStackDetails.invalidate({ stackId: params.id.toString() });

    const filteredFiles = treeToTemplate(filterIgnoredFiles(template.files));
    const labsNode = template?.files?.[".labs"];
    const projectPrompt =
      labsNode && "directory" in labsNode
        ? labsNode.directory?.prompt && "file" in labsNode.directory.prompt
          ? labsNode.directory.prompt.file.contents ?? ""
          : ""
        : "";

    await createMessage({
      stackId: params?.id as string,
      parts: [{ type: "text", text: message }],
      role: "user",
    });

  setMessages([]);

    sendMessage(
      {
        text: message,
        files,
      },
      {
        body: {
          projectFiles: filteredFiles,
          projectPrompt,
        },
      }
    );
    setFiles(null);
  }

  async function initializeFiles() {
    const instance = webContainerInstance || (await bootWebContainer());
    await mountAndRun(stackDetails?.stack?.files as any, instance);
  }

  useEffect(() => {
    const message = searchParams.get("message");

    // If there's a message, handle it and don't mount files
    if (message && !hasRequestedRef.current) {
      hasRequestedRef.current = true;
      sendMessageFirstTime(message);
      router.replace(pathname);
      return; // Exit early, don't mount files
    } else if (
      !webContainerInstance &&
      !hasRequestedRef.current &&
      !hasBootedRef.current &&
      stackDetails?.stack?.files
    ) {
      hasBootedRef.current = true;
      initializeFiles();
    }
  }, [
    webContainerInstance,
    searchParams,
    pathname,
    router,
    bootWebContainer,
    stackDetails,
  ]);

  return (
    <div className="w-full h-screen relative flex flex-col">
      <div className="shrink-0">
        <TopView />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="flex h-full">
          {/* Left div with fixed width */}
          <div className="w-full md:w-[500px] flex-shrink-0">
            <div className="h-full w-full overflow-auto">
              <LeftSideView />
            </div>
          </div>
          {/* Right div that takes remaining space */}
          <div className="flex-1 min-w-0 hidden md:block w-full">
            <div className="h-full w-full overflow-auto">
              <RightSideView />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
