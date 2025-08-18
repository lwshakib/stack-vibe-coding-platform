import { useSingleStack } from "@/context/SingleStackProvider";

export const useActiveTab = () => {
  const { activeTab, setActiveTab } = useSingleStack();

  return {
    activeTab,
    setActiveTab,
    isCodeEditor: activeTab === "code-editor",
    isWebPreview: activeTab === "web-preview",
  };
};
