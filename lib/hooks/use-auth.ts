import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName?: string;
}

// Login Mutation
export function useLogin() {
  const router = useRouter();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile to determine role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      return { ...data, role: profile?.role || "user" };
    },
    onSuccess: (data) => {
      toast.success("Login successful!", {
        description: `Welcome back, ${data.user.email}`,
      });
      // Redirect based on role
      const redirectPath = data.role === "admin" ? "/quiz" : "/quizzes";
      router.push(redirectPath);
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error("Login failed", {
        description: error.message,
      });
    },
  });
}

// Register Mutation
export function useRegister() {
  const router = useRouter();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ email, password, fullName }: RegisterCredentials) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split("@")[0],
            role: "user",
          },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.user) {
        toast.success("Registration successful!", {
          description: "Welcome to EchoTest. Redirecting...",
        });
        // New users are always "user" role, redirect to /quizzes
        router.push("/quizzes");
        router.refresh();
      }
    },
    onError: (error: Error) => {
      toast.error("Registration failed", {
        description: error.message,
      });
    },
  });
}

// Google Login Mutation
export function useGoogleLogin() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account', // Selalu tampilkan account picker
          },
        },
      });

      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      toast.error("Google login failed", {
        description: error.message,
      });
    },
  });
}

// Logout Mutation
export function useLogout() {
  const router = useRouter();
  const supabase = createClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error("Logout failed", {
        description: error.message,
      });
    },
  });
}

// Get current user hook
export function useUser() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
  });
}
