import { Session } from "@supabase/supabase-js";
import { create } from "zustand";

type AuthState = {
  session: Session | null;
  loading: boolean;
  onboardingCompleted: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (value: boolean) => void;
  setOnboardingCompleted: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,
  onboardingCompleted: false,
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
}));
