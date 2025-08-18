import { Button } from "@/components/ui/button";
import { useSingleStack } from "@/context/SingleStackProvider";
import {
  CheckCircle,
  ExternalLink,
  Monitor,
  Package,
  Rocket,
  RotateCcw,
  Smartphone,
  Tablet,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { CustomSearchBar } from "./CustomSearchBar";

type ResponsiveMode = "desktop" | "tablet" | "mobile";

type WebContainerState = "booting" | "installing" | "starting" | "ready";

interface WebPreviewHeaderProps {
  url: string;
  setUrl: (url: string) => void;
  responsiveMode: ResponsiveMode;
  setResponsiveMode: (mode: ResponsiveMode) => void;
  webPreviewUrl: string | null;
  webContainerPort: number | null;
}

function WebPreviewHeader({
  url,
  setUrl,
  responsiveMode,
  setResponsiveMode,
  webPreviewUrl,
  webContainerPort,
}: WebPreviewHeaderProps) {
  const handleRefresh = () => {
    // Refresh the preview
    console.log("Refreshing preview...");
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
  };

  const handleUrlSubmit = (value: string) => {
    // Trigger preview update on Enter
    console.log("Loading URL:", value);
  };

  const handleResponsiveModeToggle = () => {
    const modes: ResponsiveMode[] = ["desktop", "tablet", "mobile"];
    const currentIndex = modes.indexOf(responsiveMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setResponsiveMode(modes[nextIndex]);
    console.log("Responsive mode changed to:", modes[nextIndex]);
  };

  const getResponsiveIcon = () => {
    switch (responsiveMode) {
      case "desktop":
        return <Monitor className="h-3 w-3" />;
      case "tablet":
        return <Tablet className="h-3 w-3" />;
      case "mobile":
        return <Smartphone className="h-3 w-3" />;
    }
  };

  const getResponsiveTitle = () => {
    switch (responsiveMode) {
      case "desktop":
        return "Desktop view - Click to switch to tablet";
      case "tablet":
        return "Tablet view - Click to switch to mobile";
      case "mobile":
        return "Mobile view - Click to switch to desktop";
    }
  };

  const getFullUrl = (path: string) => {
    if (!webPreviewUrl) return "";
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${webPreviewUrl}${cleanPath}`;
  };

  return (
    <div className="flex items-center justify-between px-2 md:px-3 py-1.5 border-b bg-background dark:bg-[#1e1e1e]">
      <div className="flex items-center gap-1 md:gap-2 min-w-0 flex-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="cursor-pointer h-6 w-6 md:h-8 md:w-8 p-0 flex-shrink-0"
          title="Refresh preview"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
        <div className="flex-1 min-w-0">
          <CustomSearchBar
            value={url}
            onChange={handleUrlChange}
            onSubmit={handleUrlSubmit}
            placeholder="Enter path..."
            port={webContainerPort || 3000}
          />
        </div>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-6 w-6 md:h-8 md:w-8 p-0"
          title="Open in new tab"
          disabled={!webPreviewUrl}
        >
          <a href={getFullUrl(url)} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResponsiveModeToggle}
          className="h-6 w-6 md:h-8 md:w-8 p-0"
          title={getResponsiveTitle()}
        >
          {getResponsiveIcon()}
        </Button>
      </div>
    </div>
  );
}

export default function WebPreview() {
  const {
    webPreviewUrl,
    webContainerPort,
    isBootingWebContainer,
    isInstallingDependencies,
    isDevServerRunning,
  } = useSingleStack();

  const [url, setUrl] = useState("/");
  const [responsiveMode, setResponsiveMode] =
    useState<ResponsiveMode>("desktop");

  // Determine the current WebContainer state based on actual hooks
  const getCurrentWebContainerState = (): WebContainerState => {
    if (isBootingWebContainer) return "booting";
    if (isInstallingDependencies) return "installing";
    if (isDevServerRunning && !webPreviewUrl) return "starting";
    if (webPreviewUrl) return "ready";
    return "booting"; // Default state
  };

  const webContainerState = getCurrentWebContainerState();

  const getStateIcon = (state: WebContainerState) => {
    switch (state) {
      case "booting":
        return <Rocket className="h-16 w-16 text-primary" />;
      case "installing":
        return <Package className="h-16 w-16 text-primary" />;
      case "starting":
        return <Zap className="h-16 w-16 text-primary" />;
      case "ready":
        return <CheckCircle className="h-16 w-16 text-green-500" />;
    }
  };

  const getStateTitle = (state: WebContainerState) => {
    switch (state) {
      case "booting":
        return "WebContainer is Booting";
      case "installing":
        return "Installing Dependencies";
      case "starting":
        return "Starting Dev Server";
      case "ready":
        return "Development Server Ready";
    }
  };

  const getStateDescription = (state: WebContainerState) => {
    switch (state) {
      case "booting":
        return "Initializing the web container environment...";
      case "installing":
        return "Downloading and installing project dependencies...";
      case "starting":
        return "Launching the development server...";
      case "ready":
        return "Your preview is ready!";
    }
  };

  const getProgressValue = (state: WebContainerState) => {
    switch (state) {
      case "booting":
        return 25;
      case "installing":
        return 60;
      case "starting":
        return 90;
      case "ready":
        return 100;
    }
  };

  const getIframeStyles = () => {
    switch (responsiveMode) {
      case "desktop":
        return "w-full h-full";
      case "tablet":
        return "w-full max-w-[820px] h-full mx-auto border border-border rounded-lg shadow-lg";
      case "mobile":
        return "w-full max-w-[290px] h-full mx-auto border border-border rounded-lg shadow-lg";
    }
  };

  const getContainerStyles = () => {
    switch (responsiveMode) {
      case "desktop":
        return "flex-1 bg-transparent";
      case "tablet":
      case "mobile":
        return "flex-1 bg-muted flex items-center justify-center p-2 md:p-4 overflow-auto";
    }
  };

  const getFullUrl = (path: string) => {
    if (!webPreviewUrl) return "";
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${webPreviewUrl}${cleanPath}`;
  };

  // Show loading state when webPreviewUrl is not available
  if (!webPreviewUrl) {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="flex items-center justify-between px-2 md:px-3 py-1.5 border-b bg-background dark:bg-[#1e1e1e]">
          <div className="flex items-center gap-1 md:gap-2 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="cursor-pointer h-6 w-6 md:h-8 md:w-8 p-0 flex-shrink-0"
              title="Refresh preview"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <div className="flex-1 min-w-0">
              <CustomSearchBar
                value=""
                onChange={() => {}}
                onSubmit={() => {}}
                placeholder="Enter path..."
                port={webContainerPort || 3000}
              />
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="h-6 w-6 md:h-8 md:w-8 p-0"
              title="Open in new tab"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="h-6 w-6 md:h-8 md:w-8 p-0"
              title="Responsive mode"
            >
              <Monitor className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex-1 bg-muted flex items-center justify-center p-4">
          <div className="text-center max-w-md flex flex-col items-center">
            <div className="text-6xl mb-6 animate-pulse flex items-center justify-center">
              {getStateIcon(webContainerState)}
            </div>
            <div className="text-xl font-semibold text-foreground mb-3">
              {getStateTitle(webContainerState)}
            </div>
            <div className="text-sm text-muted-foreground mb-6">
              {getStateDescription(webContainerState)}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-background rounded-full h-2 mb-4">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${getProgressValue(webContainerState)}%` }}
              />
            </div>

            <div className="text-xs text-muted-foreground">
              {getProgressValue(webContainerState)}% Complete
            </div>

            {/* Show port information when available */}
            {webContainerPort && (
              <div className="mt-4 p-2 bg-background rounded-md border">
                <div className="text-xs text-muted-foreground">
                  Dev Server Port: {webContainerPort}
                </div>
              </div>
            )}

            {/* Show current state details */}
            <div className="mt-4 p-3 bg-background rounded-md border">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Booting: {isBootingWebContainer ? "Yes" : "No"}</div>
                <div>Installing: {isInstallingDependencies ? "Yes" : "No"}</div>
                <div>Dev Server: {isDevServerRunning ? "Yes" : "No"}</div>
                <div>Port: {webContainerPort || "Not set"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <WebPreviewHeader
        url={url}
        setUrl={setUrl}
        responsiveMode={responsiveMode}
        setResponsiveMode={setResponsiveMode}
        webPreviewUrl={webPreviewUrl}
        webContainerPort={webContainerPort}
      />
      <div className={getContainerStyles()}>
        <iframe
          src={getFullUrl(url)}
          className={getIframeStyles()}
          title="Web Preview"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
