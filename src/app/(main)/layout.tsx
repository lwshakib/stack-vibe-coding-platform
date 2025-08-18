import { checkUser } from "@/lib/checkUser";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkUser();
  return <>{children}</>;
}
