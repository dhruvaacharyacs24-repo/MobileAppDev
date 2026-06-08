import { useEffect } from "react";

import { supabase } from "@/lib/supabase";
import { profileService } from "@/services/profile-service";
import { useAuthStore } from "@/store/auth-store";

export const useAuthBootstrap = () => {
  const {
    setSession,
    setLoading,
    setOnboardingCompleted,
  } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const { data } =
          await supabase.auth.getSession();

        if (!mounted) return;

        setSession(data.session);

        if (data.session?.user?.id) {
          try {
            const profile =
              await profileService.getProfile(
                data.session.user.id
              );

            console.log(
              "PROFILE RESULT",
              profile
            );

            setOnboardingCompleted(
              Boolean(profile)
            );
          } catch (error) {
            console.log(
              "[AUTH] Profile fetch failed",
              error
            );

            setOnboardingCompleted(false);
          }
        } else {
          setOnboardingCompleted(false);
        }
      } catch (error) {
        console.log(
          "[AUTH] Session restore failed",
          error
        );

        setSession(null);
        setOnboardingCompleted(false);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        async (_event, session) => {
          try {
            setSession(session);

            if (session?.user?.id) {
              try {
                const profile =
                  await profileService.getProfile(
                    session.user.id
                  );

                console.log(
                  "PROFILE RESULT",
                  profile
                );

                setOnboardingCompleted(
                  Boolean(profile)
                );
              } catch (error) {
                console.log(
                  "[AUTH] Profile fetch failed",
                  error
                );

                setOnboardingCompleted(false);
              }
            } else {
              setOnboardingCompleted(false);
            }
          } finally {
            setLoading(false);
          }
        }
      );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [
    setLoading,
    setOnboardingCompleted,
    setSession,
  ]);
};