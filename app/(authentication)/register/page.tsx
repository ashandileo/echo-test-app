import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { RegisterForm } from "@/components/forms/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium text-lg"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GraduationCap className="size-4" />
            </div>
            EchoTest
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            AI-Powered English Learning Platform
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
