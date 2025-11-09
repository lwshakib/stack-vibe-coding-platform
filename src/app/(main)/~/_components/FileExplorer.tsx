import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSingleStack } from "@/context/SingleStackProvider";
import FileTree from "./FileTree";

export default function FileExplorer() {
  const { stackDetails, setSelectedFile, webContainerFiles } = useSingleStack();

  // Use WebContainer files if available, otherwise fallback to stackDetails
  const fileTreeData =
    Object.keys(webContainerFiles).length > 0
      ? webContainerFiles
      : stackDetails?.stack?.files ?? {};

  return (
    <div className="flex flex-col h-full w-full">
      <Tabs defaultValue="files" className="rounded-full">
        <TabsList className="w-full rounded-full bg-transparent">
          <TabsTrigger value="files" className="flex-1 rounded-full">
            Files
          </TabsTrigger>
          <TabsTrigger value="search" className="flex-1 rounded-full">
            Search
          </TabsTrigger>
        </TabsList>
        <Separator className="w-full" />
        <TabsContent value="files" className="mt-2">
          <ScrollArea className="h-[calc(100vh-210px)]">
            <FileTree
              data={fileTreeData}
              className="bg-transparent border-none"
              onNodeClick={(node) => {
                if (node.data) {
                  setSelectedFile(node);
                }
              }}
            />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="search" className="mt-2">
          <ScrollArea className="h-full">
            <div className="p-2">
              <Input placeholder="Search files..." className="h-8" />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
