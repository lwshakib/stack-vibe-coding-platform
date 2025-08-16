"use client";
import { trpc } from "@/utils/trpc";

export default function Home() {
  const { mutate } = trpc.createStack.useMutation();
  return (
    <div>
      <button onClick={() => mutate()}>Create Stack</button>
    </div>
  );
}
