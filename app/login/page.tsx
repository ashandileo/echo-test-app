import { GraduationCap } from "lucide-react";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <a href="#" className="flex items-center gap-2 font-medium text-lg">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GraduationCap className="size-4" />
            </div>
            EchoTest
          </a>
          <p className="text-sm text-muted-foreground text-center">
            AI-Powered English Learning Platform
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
