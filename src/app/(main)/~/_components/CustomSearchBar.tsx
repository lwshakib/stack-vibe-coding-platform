"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Radio } from "lucide-react";
import { forwardRef, useState } from "react";

interface CustomSearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  port?: number;
  className?: string;
}

const CustomSearchBar = forwardRef<HTMLDivElement, CustomSearchBarProps>(
  (
    {
      value = "",
      onChange,
      onSubmit,
      placeholder = "Enter path...",
      port = 3000,
      className,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(newValue);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onSubmit?.(internalValue);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-1 min-w-0 flex-1 border rounded-full transition-colors duration-200",
          isFocused
            ? "border-blue-500 ring-1 ring-blue-500/20"
            : "border-border hover:border-muted-foreground",
          className
        )}
      >
        <Badge
          variant="outline"
          className="text-xs flex-shrink-0 px-1.5 ml-1 border-none"
        >
          <Radio className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {port}
          </span>
        </Badge>
        <input
          value={internalValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="text-xs h-8 px-2 min-w-0 flex-1 bg-transparent border-none outline-none"
          placeholder={placeholder}
        />
      </div>
    );
  }
);

CustomSearchBar.displayName = "CustomSearchBar";

export { CustomSearchBar };
