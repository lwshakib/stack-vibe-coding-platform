"use client";

import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSingleStack } from "@/context/SingleStackProvider";
import { trpc } from "@/utils/trpc";
import { Download, Github, Lock, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TopView() {
  const { resolvedTheme } = useTheme();
  const { stackDetails } = useSingleStack();
  const utils = trpc.useUtils();
  const { mutateAsync: updateStack } = trpc.updateStack.useMutation();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isGithubDialogOpen, setIsGithubDialogOpen] = useState(false);
  const [githubStatus, setGithubStatus] = useState<{
    connected: boolean;
    data?: any;
    loading: boolean;
  }>({ connected: false, loading: false });

  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [repoDescription, setRepoDescription] = useState("");
  const [repoPrivate, setRepoPrivate] = useState(true);
  const [isSubmittingRepo, setIsSubmittingRepo] = useState(false);
  const [createRepoError, setCreateRepoError] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [commitSuccess, setCommitSuccess] = useState<string | null>(null);
  const [isUnlinkingRepo, setIsUnlinkingRepo] = useState(false);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);
  const [isGeneratingReadme, setIsGeneratingReadme] = useState(false);
  const [readmeError, setReadmeError] = useState<string | null>(null);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [enhanceReadme, setEnhanceReadme] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const currentName = stackDetails?.stack?.name ?? "";
  const stackId = stackDetails?.stack?.id as string | undefined;

  const startEditing = () => {
    setNameInput(currentName);
    setIsEditingName(true);
  };

  const cancelEditing = () => {
    setIsEditingName(false);
    setNameInput("");
  };

  const submitName = async () => {
    if (!stackId) return cancelEditing();
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === currentName) return cancelEditing();
    try {
      await updateStack({ stackId, name: trimmed });
      await utils.getStackDetails.invalidate({ stackId });
    } finally {
      setIsEditingName(false);
    }
  };

  const checkGithubConnection = async () => {
    setGithubStatus({ connected: false, loading: true });
    try {
      const response = await fetch(
        `/api/github/auth/access${stackId ? `?stackId=${stackId}` : ""}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("GitHub connection data:", data);
        setGithubStatus({ connected: true, data, loading: false });
      } else {
        setGithubStatus({ connected: false, loading: false });
      }
    } catch (error) {
      console.error("Error checking GitHub connection:", error);
      setGithubStatus({ connected: false, loading: false });
    }
  };

  const handleConnectToGithub = async () => {
    try {
      // Redirect to the GitHub connect endpoint which will handle the OAuth flow
      window.location.href = `/api/github/auth/connect`;
    } catch (error) {
      console.error("Error connecting to GitHub:", error);
    }
  };

  // Check GitHub connection when dialog opens
  useEffect(() => {
    if (isGithubDialogOpen) {
      checkGithubConnection();
    }
  }, [isGithubDialogOpen]);

  const handleDownloadZip = async () => {
    if (!stackId) return;

    try {
      setIsDownloading(true);

      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stackId }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error || "Failed to create ZIP file");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${stackDetails?.stack?.name || "project"}.zip`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading ZIP:", error);
      // You could add a toast notification here if you have a toast system
    } finally {
      setIsDownloading(false);
    }
  };

  const resetGithubDialogState = () => {
    setIsCreatingRepo(false);
    setRepoName("");
    setRepoDescription("");
    setRepoPrivate(true);
    setIsSubmittingRepo(false);
    setCreateRepoError(null);
    setIsDisconnecting(false);
    setDisconnectError(null);
    setIsUnlinkingRepo(false);
    setUnlinkError(null);
    setCommitMessage("");
    setIsCommitting(false);
    setCommitError(null);
    setCommitSuccess(null);
    setIsGeneratingReadme(false);
    setReadmeError(null);
    setReadmeContent(null);
    setEnhanceReadme(false);
    setIsDownloading(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsGithubDialogOpen(open);
    if (!open) {
      resetGithubDialogState();
    }
  };

  const handleStartCreateRepo = () => {
    setIsCreatingRepo(true);
    setCreateRepoError(null);
  };

  const handleCancelCreateRepo = () => {
    resetGithubDialogState();
  };

  const handleCreateRepo = async () => {
    const trimmedName = repoName.trim();
    if (!trimmedName) return;
    try {
      setIsSubmittingRepo(true);
      setCreateRepoError(null);
      const response = await fetch("/api/github/auth/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createRepo",
          repoName: trimmedName,
          repoDescription: repoDescription.trim(),
          repoVisibility: repoPrivate ? "private" : "public",
          stackId,
        }),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error || "Failed to create repository");
      }
      // After success, go back to list and refresh
      resetGithubDialogState();
      await checkGithubConnection();
    } catch (error) {
      console.error("Error creating repo:", error);
      setCreateRepoError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsSubmittingRepo(false);
    }
  };

  const handleGenerateReadme = async () => {
    if (!stackId || !githubStatus.data?.repo) return;

    try {
      setIsGeneratingReadme(true);
      setReadmeError(null);
      setReadmeContent(null);

      const response = await fetch("/api/github/auth/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateReadme",
          stackId,
          repoName: githubStatus.data.repo.name,
          repoUrl: githubStatus.data.repo.html_url,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error || "Failed to generate README");
      }

      const data = await response.json();
      setReadmeContent(data.readme);
    } catch (error) {
      console.error("Error generating README:", error);
      setReadmeError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsGeneratingReadme(false);
    }
  };

  const handleRemoveGithubAccount = async () => {
    try {
      setIsDisconnecting(true);
      setDisconnectError(null);
      const response = await fetch("/api/github/auth/access", {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error || "Failed to remove GitHub account");
      }
      setGithubStatus({ connected: false, loading: false });
      resetGithubDialogState();
    } catch (error) {
      console.error("Error removing GitHub account:", error);
      setDisconnectError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleUnlinkRepo = async () => {
    if (!stackId) return;
    try {
      setIsUnlinkingRepo(true);
      setUnlinkError(null);
      const response = await fetch("/api/github/auth/access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stackId }),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error || "Failed to unlink repository");
      }
      // Refresh the GitHub connection status to show no repo linked
      await checkGithubConnection();
    } catch (error) {
      console.error("Error unlinking repo:", error);
      setUnlinkError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsUnlinkingRepo(false);
    }
  };

  const handleCommitAndPush = async () => {
    if (!stackId) return;
    setIsCommitting(true);
    setCommitError(null);
    setCommitSuccess(null);

    try {
      let finalCommitMessage = commitMessage.trim() || "Update from Stack";
      let filesToCommit = stackDetails?.stack?.files || {};

      // If enhance README is enabled, generate README first
      if (enhanceReadme) {
        try {
          setIsGeneratingReadme(true);
          setReadmeError(null);

          const readmeResponse = await fetch("/api/github/auth/access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "generateReadme",
              stackId,
              repoName: githubStatus.data?.repo?.name,
              repoUrl: githubStatus.data?.repo?.html_url,
            }),
          });

          if (readmeResponse.ok) {
            const readmeData = await readmeResponse.json();
            const readmeContent = readmeData.readme;

            // Add README.md to the files
            const enhancedFiles = {
              ...filesToCommit,
              "README.md": { file: { contents: readmeContent } },
            };

            // Update the commit message
            finalCommitMessage = `Add comprehensive README.md\n\n${finalCommitMessage}`;

            // Update the stack with enhanced files including README
            await updateStack({
              stackId,
              files: enhancedFiles,
            });

            // Use enhanced files for commit
            filesToCommit = enhancedFiles;
          }
        } catch (error) {
          console.error("Error generating README:", error);
          // Continue with commit even if README generation fails
        } finally {
          setIsGeneratingReadme(false);
        }
      }

      const response = await fetch("/api/github/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commitMessage: finalCommitMessage,
          stackId,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error || "Failed to commit and push");
      }

      const data = await response.json();
      setCommitSuccess(
        `Committed ${
          data.commitSha ? data.commitSha.slice(0, 7) : "successfully"
        }${enhanceReadme ? " with enhanced README" : ""}`
      );
      setCommitMessage("");
    } catch (error) {
      console.error("Error committing:", error);
      setCommitError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsCommitting(false);
    }
  };

  const logoSrc =
    resolvedTheme === "dark" ? "/dark_logo.svg" : "/light_logo.svg";
  return (
    <div className="bg-background border-b border-border px-6 py-2 flex-shrink-0">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <Image
            src={logoSrc}
            alt="logo"
            width={32}
            height={32}
            className="w-6 h-6 mr-2"
          />
          <h2 className="text-foreground text-base font-medium">Stack</h2>
        </Link>

        <div className="flex items-center space-x-2">
          {isEditingName ? (
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={submitName}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitName();
                if (e.key === "Escape") cancelEditing();
              }}
              autoFocus
              className="h-6 px-2 py-0 text-base font-medium"
            />
          ) : (
            <h2
              className="text-foreground text-base font-medium cursor-text hover:opacity-80"
              onClick={startEditing}
              title="Click to rename"
            >
              {currentName}
            </h2>
          )}
          <Lock className="w-3 h-3 text-muted-foreground" />
        </div>

        <div className="flex items-center space-x-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Export"
                title="Export"
                disabled={isDownloading}
              >
                <Download className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Download Project Files</AlertDialogTitle>
                <AlertDialogDescription>
                  This will download all your project files and folders as a ZIP
                  file named "{stackDetails?.stack?.name || "project"}.zip". The
                  ZIP will maintain the exact directory structure of your
                  project.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDownloadZip}
                  disabled={isDownloading}
                >
                  {isDownloading ? "Downloading..." : "Download ZIP"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog
            open={isGithubDialogOpen}
            onOpenChange={handleDialogOpenChange}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="GitHub"
                title="GitHub"
              >
                <Github className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>GitHub Repositories</DialogTitle>
                <DialogDescription>
                  {githubStatus.loading
                    ? "Checking GitHub connection..."
                    : githubStatus.connected
                    ? "Your GitHub repositories"
                    : "Connect your project to GitHub to enable version control and collaboration features."}
                </DialogDescription>
              </DialogHeader>

              {githubStatus.loading ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Loading repositories...
                </div>
              ) : githubStatus.connected ? (
                isCreatingRepo ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="repo-name">Repository name</Label>
                      <Input
                        id="repo-name"
                        placeholder="my-awesome-repo"
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                        disabled={isSubmittingRepo}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="repo-description">
                        Description (optional)
                      </Label>
                      <Textarea
                        id="repo-description"
                        placeholder="A short description of your repository"
                        value={repoDescription}
                        onChange={(e) => setRepoDescription(e.target.value)}
                        disabled={isSubmittingRepo}
                        className="min-h-24"
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium leading-none">
                          Private
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Only you and collaborators can see this repository
                        </p>
                      </div>
                      <Switch
                        checked={repoPrivate}
                        onCheckedChange={setRepoPrivate}
                        disabled={isSubmittingRepo}
                      />
                    </div>
                    {createRepoError && (
                      <p className="text-sm text-destructive">
                        {createRepoError}
                      </p>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCancelCreateRepo}
                        disabled={isSubmittingRepo}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateRepo}
                        disabled={!repoName.trim() || isSubmittingRepo}
                      >
                        {isSubmittingRepo ? "Creating..." : "Create"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {githubStatus.data?.repo ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-md border">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-sm font-medium truncate">
                              {githubStatus.data.repo.name}
                            </span>
                            {githubStatus.data.repo.private && (
                              <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground ml-2">
                            {githubStatus.data.repo.language || "No language"}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="commit-message">Commit message</Label>
                          <Input
                            id="commit-message"
                            placeholder="Describe your changes"
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                            disabled={isCommitting}
                          />
                          {commitError && (
                            <p className="text-sm text-destructive">
                              {commitError}
                            </p>
                          )}
                          {commitSuccess && (
                            <p className="text-sm text-emerald-600">
                              {commitSuccess}
                            </p>
                          )}

                          <div className="flex items-center justify-between rounded-md border p-3">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium leading-none">
                                Enhance with AI README
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Automatically generate and include a
                                comprehensive README.md
                              </p>
                            </div>
                            <Switch
                              checked={enhanceReadme}
                              onCheckedChange={setEnhanceReadme}
                              disabled={isCommitting || isGeneratingReadme}
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={handleUnlinkRepo}
                              disabled={isUnlinkingRepo}
                            >
                              {isUnlinkingRepo ? "Unlinking..." : "Unlink Repo"}
                            </Button>
                            <Button
                              onClick={handleCommitAndPush}
                              disabled={isCommitting}
                            >
                              {isCommitting ? "Committing..." : "Commit & Push"}
                            </Button>
                          </div>
                        </div>

                        {readmeError && (
                          <p className="text-sm text-destructive">
                            {readmeError}
                          </p>
                        )}

                        {readmeContent && (
                          <div className="space-y-2">
                            <Label>Generated README.md</Label>
                            <div className="max-h-60 overflow-y-auto p-3 border rounded-md bg-muted/50">
                              <pre className="text-xs whitespace-pre-wrap">
                                {readmeContent}
                              </pre>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReadmeContent(null)}
                              >
                                Clear
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setCommitMessage(
                                    `Add README.md\n\n${readmeContent}`
                                  );
                                }}
                              >
                                Use as Commit Message
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">
                            No repository linked
                          </h3>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={handleStartCreateRepo}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Create Repo
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Create a new repository and link it to this project.
                        </p>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="flex justify-end space-x-2">
                  <Button onClick={handleConnectToGithub}>
                    Connect to GitHub
                  </Button>
                </div>
              )}
              {githubStatus.connected && !isCreatingRepo && (
                <div className="mt-4 border-t pt-3 flex items-center justify-between">
                  {(disconnectError || unlinkError || readmeError) && (
                    <p className="text-sm text-destructive">
                      {disconnectError || unlinkError || readmeError}
                    </p>
                  )}
                  <div className="flex-1" />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isDisconnecting}
                      >
                        Remove GitHub account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Remove GitHub account?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will disconnect your GitHub account from this
                          project. You can reconnect at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleRemoveGithubAccount}
                          disabled={isDisconnecting}
                        >
                          {isDisconnecting ? "Removing..." : "Remove"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <ThemeToggle />
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
