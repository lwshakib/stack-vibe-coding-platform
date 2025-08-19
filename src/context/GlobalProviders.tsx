"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { ThemeProvider } from "@/components/theme-provider";
import React, { useState } from "react";
import { Toaster } from "sonner";
import { trpc } from "../utils/trpc";
import StackProvider from "./StackProvider";

export default function GlobalProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:3000/api/trpc",
        }),
      ],
    })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <StackProvider>
            {children}
            <Toaster />
          </StackProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ThemeProvider>
  );
}
