import { supabase } from "@/lib/supabase";

export const authService = {
  signUp: async (email: string, password: string) =>
    supabase.auth.signUp({
      email,
      password,
    }),

  signIn: async (email: string, password: string) =>
    supabase.auth.signInWithPassword({
      email,
      password,
    }),

  signOut: async () => supabase.auth.signOut(),

  resetPassword: async (email: string) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "skillsyncai://reset-password",
    }),
};
