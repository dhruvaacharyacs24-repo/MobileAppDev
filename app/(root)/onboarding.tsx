import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActivityIndicator, ScrollView, Text } from "react-native";
import { z } from "zod";

import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientScreen } from "@/components/ui/gradient-screen";
import { profileService } from "@/services/profile-service";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  full_name: z.string().min(2),
  education: z.string().min(3),
  interests: z.string().min(2),
  projects: z.string().min(2),
  certifications: z.string().min(2),
  resume_text: z.string().min(20),
  github_url: z
    .string()
    .trim()
    .refine((value) => value === "" || z.string().url().safeParse(value).success, "Enter a valid URL"),
  linkedin_url: z
    .string()
    .trim()
    .refine((value) => value === "" || z.string().url().safeParse(value).success, "Enter a valid URL"),
  preferred_career_path: z.string().min(2),
  skills: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;

export default function OnboardingScreen() {
  const { session, setOnboardingCompleted } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      education: "",
      interests: "",
      projects: "",
      certifications: "",
      resume_text: "",
      github_url: "",
      linkedin_url: "",
      preferred_career_path: "",
      skills: "",
    },
  });

  const profileQuery = useQuery({
    queryKey: ["onboarding-profile", session?.user.id],
    queryFn: () => profileService.getProfile(session!.user.id),
    enabled: Boolean(session?.user.id),
  });

  const skillsQuery = useQuery({
    queryKey: ["onboarding-skills", session?.user.id],
    queryFn: () => profileService.getSkills(session!.user.id),
    enabled: Boolean(session?.user.id),
  });

  useEffect(() => {
    if (!profileQuery.data) return;

    reset({
      full_name: profileQuery.data.full_name ?? "",
      education: profileQuery.data.education ?? "",
      interests: (profileQuery.data.interests ?? []).join(", "),
      projects: (profileQuery.data.projects ?? []).join(", "),
      certifications: (profileQuery.data.certifications ?? []).join(", "),
      resume_text: profileQuery.data.resume_text ?? "",
      github_url: profileQuery.data.github_url ?? "",
      linkedin_url: profileQuery.data.linkedin_url ?? "",
      preferred_career_path: profileQuery.data.preferred_career_path ?? "",
      skills: (skillsQuery.data ?? []).map((s) => s.name).join(", "),
    });
  }, [profileQuery.data, reset, skillsQuery.data]);

  const onSubmit = async (values: FormValues) => {
    if (!session?.user.id) return;

    setLoading(true);
    setError("");

    try {
      await profileService.upsertOnboarding(session.user.id, {
        ...values,
        github_url: values.github_url.trim(),
        linkedin_url: values.linkedin_url.trim(),
        interests: values.interests.split(",").map((v) => v.trim()),
        projects: values.projects.split(",").map((v) => v.trim()),
        certifications: values.certifications.split(",").map((v) => v.trim()),
        skills: values.skills.split(",").map((v) => v.trim()),
      });

      setOnboardingCompleted(true);

      // IMPORTANT:
      // No router.replace("/")
      // ProtectedLayout should redirect automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientScreen>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 24 }}>
        <GlassCard>
          <Text className="mb-5 text-2xl font-bold text-zinc-100">
            Complete your profile
          </Text>

          {profileQuery.isLoading || skillsQuery.isLoading ? (
            <ActivityIndicator color="#22D3EE" className="mb-4" />
          ) : null}

          {(
            [
              ["full_name", "Full name", "Dhruv Sharma"],
              ["education", "Education", "B.Tech CSE, Semester 4"],
              ["skills", "Skills (comma-separated)", "React, TypeScript, SQL"],
              ["interests", "Interests", "AI, Product Development"],
              ["projects", "Projects", "SkillSync MVP, Campus Portal"],
              ["certifications", "Certifications", "AWS CCP, Meta RN"],
              ["resume_text", "Resume summary", "A concise summary of your resume..."],
              ["github_url", "GitHub URL (optional)", "https://github.com/username"],
              ["linkedin_url", "LinkedIn URL (optional)", "https://linkedin.com/in/username"],
              ["preferred_career_path", "Preferred career", "Frontend Engineer"],
            ] as const
          ).map(([name, label, placeholder]) => (
            <Controller
              key={name}
              control={control}
              name={name}
              render={({ field: { value, onChange }, fieldState }) => (
                <AppInput
                  label={label}
                  placeholder={placeholder}
                  value={value}
                  onChangeText={onChange}
                  multiline={name === "resume_text"}
                  error={fieldState.error?.message}
                />
              )}
            />
          ))}

          {error ? (
            <Text className="mb-3 text-sm text-rose-400">{error}</Text>
          ) : null}

          <AppButton
            label="Save and continue"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
          />
        </GlassCard>
      </ScrollView>
    </GradientScreen>
  );
}