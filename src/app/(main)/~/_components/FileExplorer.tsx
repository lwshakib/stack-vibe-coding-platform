import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileTree from "./FileTree";
import { useSingleStack } from "@/context/SingleStackProvider";

export default function FileExplorer() {
  const { stackDetails, setSelectedFile } = useSingleStack();
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
            <FileTree data={stackDetails?.stack?.files ?? {}}            className="bg-transparent border-none"         onNodeClick={(node) => {
                if (node.data) {
                  setSelectedFile(node);
                  console.log(node);
                }
              }}/>
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
