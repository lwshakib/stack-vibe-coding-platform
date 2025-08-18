import SingleStackProvider from "@/context/SingleStackProvider";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SingleStackProvider stackId={id}>{children}</SingleStackProvider>;
}
