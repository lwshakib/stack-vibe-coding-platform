import { createContext } from "@/server/context";
import { appRouter } from "@/server/routers/_app";
import { auth, currentUser } from "@clerk/nextjs/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request, res: Response) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext
  });
};

export { handler as GET, handler as POST };
