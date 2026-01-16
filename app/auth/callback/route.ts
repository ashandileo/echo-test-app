import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user has a profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      // Redirect based on role
      const redirectPath = profile?.role === "admin" ? "/quiz" : "/quizzes";
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // If error or no code, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
