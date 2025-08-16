"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { LabProvider } from "../context/LabProvider"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>
    <LabProvider>
    {children}
    </LabProvider>
    </NextThemesProvider>
}