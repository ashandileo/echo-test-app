import { redirect } from "next/navigation";

import { getCurrentUser, getProfile } from "@/lib/auth/get-user";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile to determine role
  const profile = await getProfile(user.id);
  const userRole = profile?.role || "user";

  // Redirect based on role
  if (userRole === "admin") {
    redirect("/quiz");
  } else {
    redirect("/quizzes");
  }
}
