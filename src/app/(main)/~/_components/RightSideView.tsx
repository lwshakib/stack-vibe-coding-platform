"use client";

import { useActiveTab } from "@/hooks/use-active-tab";
import React from "react";
import CodeEditor from "./CodeEditor";
import CustomTabs from "./CustomTabs";
import WebPreview from "./WebPreview";

const RightSideView: React.FC = () => {
  const { activeTab, setActiveTab } = useActiveTab();

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="m-4 border border-border w-full h-full rounded-xl flex flex-col bg-background shadow-sm">
        <CustomTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1">
          {activeTab === "code-editor" ? <CodeEditor /> : <WebPreview />}
        </div>
      </div>
    </div>
  );
};

export default RightSideView;
