import { Session } from "@supabase/supabase-js";
import { create } from "zustand";

type AuthState = {
  session: Session | null;
  loading: boolean;
  onboardingCompleted: boolean;
  editingOnboarding: boolean;

  setSession: (session: Session | null) => void;
  setLoading: (value: boolean) => void;
  setOnboardingCompleted: (value: boolean) => void;
  setEditingOnboarding: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,
  onboardingCompleted: false,
  editingOnboarding: false,

  setSession: (session) => set({ session }),

  setLoading: (loading) => set({ loading }),

  setOnboardingCompleted: (onboardingCompleted) =>
    set({ onboardingCompleted }),

  setEditingOnboarding: (editingOnboarding) =>
    set({ editingOnboarding }),
}));