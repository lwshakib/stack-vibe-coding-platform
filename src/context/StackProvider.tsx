import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

interface StackContextType {
  currentStack: any;
  setCurrentStack: (stack: any) => void;
  stacks: any;
  setStacks: (stacks: any) => void;
  files: any | undefined;
  setFiles: Dispatch<SetStateAction<any | undefined>>;
}

interface StackProviderProps {
  children: React.ReactNode;
}

const StackContext = createContext<StackContextType | null>(null);

export default function StackProvider({ children }: StackProviderProps) {
  const [currentStack, setCurrentStack] = useState();
  const [stacks, setStacks] = useState([]);
  const [files, setFiles] = useState<any | undefined>(undefined);

  return (
    <StackContext.Provider
      value={{
        currentStack,
        setCurrentStack,
        stacks,
        setStacks,
        files,
        setFiles,
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
