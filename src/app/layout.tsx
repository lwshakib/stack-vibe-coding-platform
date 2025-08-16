import GlobalProviders from "@/context/GlobalProviders";
import { checkUser } from "@/lib/checkUser";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "Stack: Vibe Coding Platform - React, Next.js, Expo & Node.js Development",
  description:
    "Professional coding platform supporting React, Next.js, Expo, and Node.js development. Build, deploy, and manage your projects with ease.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await checkUser();
  return (
    <ClerkProvider
      appearance={{
        baseTheme: shadcn,
      }}
    >
      <html lang="en">
        <body>
          <GlobalProviders>{children}</GlobalProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
