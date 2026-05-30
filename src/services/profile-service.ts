import { supabase } from "@/lib/supabase";
import { Profile } from "@/types";

type OnboardingPayload = Omit<Profile, "id"> & { skills: string[] };

export const profileService = {
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    if (!data) return null;
    return {
      ...data,
      github_url: data.github_url ?? "",
      linkedin_url: data.linkedin_url ?? "",
    } as Profile;
  },

  upsertOnboarding: async (userId: string, payload: OnboardingPayload) => {
    const { skills, ...profile } = payload;

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      ...profile,
      github_url: profile.github_url || null,
      linkedin_url: profile.linkedin_url || null,
    });
    if (profileError) throw profileError;

    const { error: clearError } = await supabase
      .from("skills")
      .delete()
      .eq("user_id", userId);
    if (clearError) throw clearError;

    const skillRows = skills.map((name) => ({ user_id: userId, name, level: 3 }));
    if (skillRows.length > 0) {
      const { error: skillsError } = await supabase.from("skills").insert(skillRows);
      if (skillsError) throw skillsError;
    }
  },

  getSkills: async (userId: string) => {
    const { data, error } = await supabase.from("skills").select("*").eq("user_id", userId);
    if (error) throw error;
    return data ?? [];
  },
};
