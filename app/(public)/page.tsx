import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BarChart3,
  Brain,
  FileText,
  GraduationCap,
  Mic,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import logo from "./../../public/logo.webp";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden">
              <Image
                src={logo}
                alt="EchoTest Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-blue-900">EchoTest</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-36 text-center relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <Badge className="mb-6 gap-1" variant="outline">
          <Sparkles className="h-3 w-3" />
          AI-Powered Quiz Platform
        </Badge>

        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
          Interactive Quiz Platform
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            for Learning
          </span>
        </h2>

        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
          A web-based platform to create and take quizzes with AI assistance.
          Designed for educational purposes and learning management.
        </p>

        <div className="flex gap-4 justify-center flex-wrap mb-16">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Features Highlight - Enhanced */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-24 max-w-5xl mx-auto">
          <div className="group h-full">
            <div className="p-6 bg-card border-2 border-border rounded-2xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
              <div className="mb-4">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto group-hover:bg-primary/20 transition-colors">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Generate questions automatically
              </p>
            </div>
          </div>

          <div className="group h-full">
            <div className="p-6 bg-card border-2 border-border rounded-2xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
              <div className="mb-4">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Multiple Types</h3>
              <p className="text-sm text-muted-foreground">
                MCQ, essays, and audio
              </p>
            </div>
          </div>

          <div className="group h-full">
            <div className="p-6 bg-card border-2 border-border rounded-2xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
              <div className="mb-4">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track your progress
              </p>
            </div>
          </div>

          <div className="group h-full">
            <div className="p-6 bg-card border-2 border-border rounded-2xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
              <div className="mb-4">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto group-hover:bg-primary/20 transition-colors">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Audio Support</h3>
              <p className="text-sm text-muted-foreground">
                Record voice responses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-24 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-4" variant="outline">
              How It Works
            </Badge>
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Simple 3-Step Process
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started with EchoTest in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connecting line - only visible on desktop */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 -z-10" />

            <div className="relative">
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group h-full">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl font-bold text-primary-foreground">
                      1
                    </span>
                  </div>
                  <CardTitle className="text-2xl mb-3">
                    Create Account
                  </CardTitle>
                  <CardDescription className="text-base">
                    Register with your email to get started on your learning
                    journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Quick and easy registration process
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group h-full">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl font-bold text-primary-foreground">
                      2
                    </span>
                  </div>
                  <CardTitle className="text-2xl mb-3">
                    Create or Take Quiz
                  </CardTitle>
                  <CardDescription className="text-base">
                    Make new quizzes with AI or participate in existing ones
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Flexible quiz creation and taking options
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group h-full">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl font-bold text-primary-foreground">
                      3
                    </span>
                  </div>
                  <CardTitle className="text-2xl mb-3">View Results</CardTitle>
                  <CardDescription className="text-base">
                    Check your scores and track your submission history
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Detailed performance insights
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Below Steps */}
          <div className="text-center mt-16">
            <Card className="max-w-2xl mx-auto border-2 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-lg">
              <CardHeader className="pb-4">
                <Badge className="w-fit mx-auto mb-4" variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  Academic Project
                </Badge>
                <CardTitle className="text-3xl md:text-4xl mb-3">
                  Ready to Get Started?
                </CardTitle>
                <CardDescription className="text-base md:text-lg">
                  Create your account and explore the quiz platform features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/register">
                  <Button size="lg" className="w-full max-w-xs gap-2">
                    Create Account <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-4">
                  Developed as an undergraduate thesis project
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30 mt-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                  <Image
                    src={logo}
                    alt="EchoTest Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <h1 className="text-2xl font-bold">EchoTest</h1>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
                An interactive quiz platform with AI assistance for educational
                purposes. Developed as an undergraduate thesis project to
                support modern learning and assessment.
              </p>
              <div className="flex gap-4">
                <Link href="/register">
                  <Button size="sm" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/register"
                    className="hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="h-3 w-3" />
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="h-3 w-3" />
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="h-3 w-3" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="h-3 w-3" />
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                © 2026 EchoTest. Educational project for academic purposes.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="gap-1">
                  <GraduationCap className="h-3 w-3" />
                  Thesis Project
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
