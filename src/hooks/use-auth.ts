import { useEffect } from "react";

import { supabase } from "@/lib/supabase";
import { profileService } from "@/services/profile-service";
import { useAuthStore } from "@/store/auth-store";

export const useAuthBootstrap = () => {
  const { setSession, setLoading, setOnboardingCompleted } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user?.id) {
        const profile = await profileService.getProfile(data.session.user.id);
        setOnboardingCompleted(Boolean(profile));
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        const profile = await profileService.getProfile(session.user.id);
        setOnboardingCompleted(Boolean(profile));
      } else {
        setOnboardingCompleted(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setLoading, setOnboardingCompleted, setSession]);
};