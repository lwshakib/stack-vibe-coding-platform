"use client";
import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import AiInput from "@/components/ui/ai-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStack } from "@/context/StackProvider";
import { trpc } from "@/utils/trpc";
import { UserButton, useUser } from "@clerk/nextjs";
import { Github } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const { resolvedTheme } = useTheme();
  const { user, isSignedIn, isLoaded } = useUser();
  const { setStacks } = useStack();
  const router = useRouter();
  const { mutateAsync: createStack } = trpc.createStack.useMutation();

  // Determine which logo to use based on resolved theme
  const logoSrc =
    resolvedTheme === "dark" ? "/dark_logo.svg" : "/light_logo.svg";

  const handleClickBadge = async (text: string) => {
    const { stack } = await createStack();
    setStacks((prev: any) => [...prev, stack]);
    router.push(`/~/${stack.id}?message=${encodeURIComponent(text)}`);
  };

  return (
    <div className="min-h-screen h-auto bg-background flex flex-col">
      {/* Sign-in Modal - Shows when no user is signed in */}
      {!isSignedIn && isLoaded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 p-6 bg-background border rounded-lg shadow-lg">
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">
                  Welcome to Stack - Vibe Coding Platform
                </h2>
                <p className="text-muted-foreground">
                  Please sign in to access all features and start coding with AI
                  assistance.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Button
                  className="w-full"
                  onClick={() => router.push("/sign-in")}
                >
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/sign-up")}
                >
                  Sign Up
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Sign in or create an account to unlock the full potential of
                  Stack - Vibe Coding Platform
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo Section */}
            <div
              className="group flex items-center space-x-3 cursor-pointer transition-all duration-200 hover:opacity-80 active:scale-95"
              onClick={() => router.push("/")}
            >
              <div className="relative w-8 h-10 transition-transform duration-200 group-hover:scale-105">
                <Image
                  src={logoSrc}
                  alt="Stack Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-foreground group-hover:to-foreground transition-all duration-200">
                Stack
              </h1>
            </div>

            {/* Center Navigation - Hidden on small screens */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="relative text-sm font-medium text-foreground/70 hover:text-foreground transition-all duration-200 hover:bg-accent/50 rounded-md px-4 py-2 h-9 group"
              >
                <span className="relative z-10">Careers</span>
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"></span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="relative text-sm font-medium text-foreground/70 hover:text-foreground transition-all duration-200 hover:bg-accent/50 rounded-md px-4 py-2 h-9 group"
              >
                <span className="relative z-10">Resources</span>
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"></span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="relative text-sm font-medium text-foreground/70 hover:text-foreground transition-all duration-200 hover:bg-accent/50 rounded-md px-4 py-2 h-9 group"
              >
                <span className="relative z-10">Community</span>
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"></span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="relative text-sm font-medium text-foreground/70 hover:text-foreground transition-all duration-200 hover:bg-accent/50 rounded-md px-4 py-2 h-9 group"
              >
                <span className="relative z-10">Pricing</span>
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"></span>
              </Button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-md hover:bg-accent/50 transition-all duration-200 hover:scale-105 active:scale-95"
                asChild
              >
                <a
                  href={
                    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
                    "https://github.com"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View repository on GitHub"
                >
                  <Github className="h-4 w-4 text-foreground/70 group-hover:text-foreground transition-colors" />
                </a>
              </Button>
              <div className="h-6 w-px bg-border/50 mx-1"></div>
              <ThemeToggle />
              {isSignedIn && isLoaded && (
                <>
                  <div className="h-6 w-px bg-border/50 mx-1"></div>
                  <div className="flex items-center space-x-2">
                    <UserButton afterSignOutUrl="/" />
                    <Sidebar />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Takes remaining height */}
      <div className="flex-1 flex flex-col px-6 py-12">
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center justify-center flex-1 space-y-12">
          {/* AI Input Section */}
          <div className="w-full max-w-3xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-3">
                What would you like to build today?
              </h2>
              <p className="text-muted-foreground text-lg">
                Describe your project and let AI help you create it
              </p>
            </div>
            <AiInput />
          </div>

          {/* Badge Suggestions */}
          <div className="w-full">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Popular project types
              </h3>
              <p className="text-sm text-muted-foreground">
                Click on any suggestion to get started
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
              <Badge
                variant="outline"
                className="rounded-full px-5 py-2 cursor-pointer hover:bg-accent/50 transition-colors text-sm font-medium"
                onClick={() => handleClickBadge("Create a Financial App")}
              >
                Create a Financial App
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full px-5 py-2 cursor-pointer hover:bg-accent/50 transition-colors text-sm font-medium"
                onClick={() => handleClickBadge("Create a Todo Mobile App")}
              >
                Create a Todo Mobile App
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full px-5 py-2 cursor-pointer hover:bg-accent/50 transition-colors text-sm font-medium"
                onClick={() => handleClickBadge("Build a Kanban Board App")}
              >
                Build a Kanban Board App
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full px-5 py-2 cursor-pointer hover:bg-accent/50 transition-colors text-sm font-medium"
                onClick={() =>
                  handleClickBadge("Build a Library Management API Server")
                }
              >
                Build a Library Management API Server
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full px-5 py-2 cursor-pointer hover:bg-accent/50 transition-colors text-sm font-medium"
                onClick={() =>
                  handleClickBadge(
                    "Build a University Student Portal API Server"
                  )
                }
              >
                Build a University Student Portal API Server
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full px-5 py-2 cursor-pointer hover:bg-accent/50 transition-colors text-sm font-medium"
                onClick={() => handleClickBadge("Create a Weather App")}
              >
                Create a Weather App
              </Badge>
            </div>
          </div>

          {/* Features Section */}
          <div className="w-full">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Why choose Stack?
              </h3>
              <p className="text-muted-foreground text-lg">
                Powerful AI-driven development platform for modern applications
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="text-center p-6 rounded-lg border border-border/50 bg-card/50">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Lightning Fast
                </h4>
                <p className="text-muted-foreground text-sm">
                  Generate complete applications in minutes, not days
                </p>
              </div>
              <div className="text-center p-6 rounded-lg border border-border/50 bg-card/50">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Production Ready
                </h4>
                <p className="text-muted-foreground text-sm">
                  Built with best practices and modern tech stacks
                </p>
              </div>
              <div className="text-center p-6 rounded-lg border border-border/50 bg-card/50">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  AI Powered
                </h4>
                <p className="text-muted-foreground text-sm">
                  Advanced AI that understands your requirements perfectly
                </p>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="w-full">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Loved by developers
              </h3>
              <p className="text-muted-foreground text-lg">
                See what others are building with Stack
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-lg border border-border/50 bg-card/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src="https://i.pravatar.cc/40?img=1"
                      alt="John Doe"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">John Doe</h4>
                    <p className="text-sm text-muted-foreground">
                      Full Stack Developer
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  "Stack helped me build a complete e-commerce platform in just
                  2 hours. The AI understood exactly what I needed!"
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border/50 bg-card/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src="https://i.pravatar.cc/40?img=2"
                      alt="Jane Smith"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Jane Smith
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Product Manager
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  "As a non-developer, I was able to create a professional
                  dashboard for my team. Stack is truly revolutionary."
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="w-full text-center">
            <div className="p-8 rounded-lg border border-border/50 bg-gradient-to-r from-primary/10 to-primary/5">
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Ready to build something amazing?
              </h3>
              <p className="text-muted-foreground text-lg mb-6">
                Join thousands of developers creating incredible applications
                with AI
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" className="px-8">
                  Start Building Now
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  View Examples
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <div className="container mx-auto px-6 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="relative w-8 h-10">
                  <Image
                    src={logoSrc}
                    alt="Stack Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-foreground">Stack</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The AI-powered development platform that helps you build,
                deploy, and scale applications faster than ever before.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground justify-start"
                  >
                    Features
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground justify-start"
                  >
                    Pricing
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground justify-start"
                  >
                    API
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground justify-start"
                  >
                    Integrations
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground justify-start"
                  >
                    Changelog
                  </Button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground justify-start"
                  >
                    About
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground justify-start"
                  >
                    Blog
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground justify-start"
                  >
                    Careers
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground justify-start"
                  >
                    Press
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground justify-start"
                  >
                    Partners
                  </Button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground justify-start"
                  >
                    Help Center
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground justify-start"
                  >
                    Documentation
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground justify-start"
                  >
                    Community
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground justify-start"
                  >
                    Contact Us
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground justify-start"
                  >
                    Status
                  </Button>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="border-t border-border/50 pt-8 mb-8">
            <div className="max-w-md">
              <h4 className="font-semibold text-foreground mb-2">
                Stay updated
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest updates on new features and improvements.
              </p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <Button size="sm" className="px-4">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-border/50 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span>© 2024 Stack. All rights reserved.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                >
                  Cookie Policy
                </Button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Made with ❤️ for developers</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
