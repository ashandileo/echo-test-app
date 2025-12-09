import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getProfile(userId: string) {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return profile;
}

export async function requireAdmin() {
  const user = await requireAuth();
  const profile = await getProfile(user.id);

  if (!profile || profile.role !== "admin") {
    redirect("/quizzes");
  }

  return { user, profile };
}

export async function requireUser() {
  const user = await requireAuth();
  const profile = await getProfile(user.id);

  if (!profile) {
    redirect("/login");
  }

  if (profile.role === "admin") {
    redirect("/quiz");
  }

  return { user, profile };
}

export async function getUserWithProfile() {
  const user = await requireAuth();
  const profile = await getProfile(user.id);

  if (!profile) {
    redirect("/login");
  }

  return { user, profile };
}
