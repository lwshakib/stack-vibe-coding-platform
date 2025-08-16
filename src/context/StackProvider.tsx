import { createContext, useContext, useState } from "react";

interface StackContextType {
  image: any;
  setImage: (image: any) => void;
  currentStack: any;
  setCurrentStack: (stack: any) => void;
  stacks: any;
  setStacks: (stacks: any) => void;
}

interface StackProviderProps {
  children: React.ReactNode;
}

const StackContext = createContext<StackContextType | null>(null);

export default function StackProvider({ children }: StackProviderProps) {
  const [image, setImage] = useState();
  const [currentStack, setCurrentStack] = useState();
  const [stacks, setStacks] = useState();
  return (
    <StackContext.Provider
      value={{
        image,
        setImage,
        currentStack,
        setCurrentStack,
        stacks,
        setStacks,
      }}
    >
      {children}
    </StackContext.Provider>
  );
}

export function useStack() {
  const context = useContext(StackContext);
  if (!context) {
    throw new Error("useStack must be used within a StackProvider");
  }
  return context;
}
