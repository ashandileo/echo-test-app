import { redirect } from "next/navigation";

import { getCurrentUser, getProfile } from "@/lib/auth/get-user";

import LandingPage from "./(public)/page";

export default async function Home() {
  const user = await getCurrentUser();

  // If not logged in, show landing page
  if (!user) {
    return <LandingPage />;
  }

  // If logged in, redirect to dashboard based on role
  const profile = await getProfile(user.id);
  const userRole = profile?.role || "user";

  // Redirect based on role
  if (userRole === "admin") {
    redirect("/quiz");
  } else {
    redirect("/quizzes");
  }
}
