import { createClient } from "@/lib/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
      return data;
    },
    onSuccess: (data) => {
      toast.success("Login successful!", {
        description: `Welcome back, ${data.user.email}`,
      });
      router.push("/quiz");
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
          description: "Welcome to EchoTest. Redirecting to quiz...",
        });
        router.push("/quiz");
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
