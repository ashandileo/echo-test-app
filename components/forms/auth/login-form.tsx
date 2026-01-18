"use client";

import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useGoogleLogin, useLogin } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";

type LoginMode = "admin" | "student";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loginMode, setLoginMode] = useState<LoginMode>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handleGoogleLogin = () => {
    googleLoginMutation.mutate();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sign in to your account</CardTitle>
          <CardDescription>
            {loginMode === "admin"
              ? "Sign in as Admin to manage quizzes"
              : "Sign in as Student to take quizzes"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Switch Mode */}
          <div className="mb-6">
            <div className="flex rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => setLoginMode("student")}
                className={cn(
                  "flex-1 rounded-md py-2 text-sm font-medium transition-all cursor-pointer",
                  loginMode === "student"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setLoginMode("admin")}
                className={cn(
                  "flex-1 rounded-md py-2 text-sm font-medium transition-all cursor-pointer",
                  loginMode === "admin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Admin
              </button>
            </div>
          </div>

          {loginMode === "admin" ? (
            /* Admin Login Form */
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loginMutation.isPending}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loginMutation.isPending}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </Field>
                <Field>
                  <Button type="submit" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          ) : (
            /* Student Login - Google Only */
            <FieldGroup>
              <Field>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={googleLoginMutation.isPending}
                  className="w-full"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {googleLoginMutation.isPending
                    ? "Connecting..."
                    : "Sign in with Google"}
                </Button>
              </Field>
              <FieldDescription className="text-center text-muted-foreground">
                Use your school Google account to sign in
              </FieldDescription>
            </FieldGroup>
          )}
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        © {new Date().getFullYear()} EchoTest. All rights reserved.
      </FieldDescription>
    </div>
  );
}
