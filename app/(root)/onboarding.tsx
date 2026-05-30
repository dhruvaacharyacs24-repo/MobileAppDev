import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { z } from "zod";

import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientScreen } from "@/components/ui/gradient-screen";
import { profileService } from "@/services/profile-service";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  
  full_name: z
    .string()
    .min(5, "Please enter your full name")
    .refine(
      (value) => value.trim().split(" ").length >= 2,
      "Enter both first and last name"
    ),

  education: z
    .string()
    .min(5, "Please provide your education details"),

  interests: z
    .string()
    .min(3, "Add at least one interest"),

  projects: z
    .string()
    .min(3, "Add at least one project"),

  certifications: z
    .string()
    .min(3, "Add at least one certification"),

  resume_text: z
    .string()
    .min(
      20,
      "Resume summary should be at least 20 characters"
    ),

  github_url: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" || z.string().url().safeParse(value).success,
      "Enter a valid GitHub URL"
    ),

  linkedin_url: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" || z.string().url().safeParse(value).success,
      "Enter a valid LinkedIn URL"
    ),

  preferred_career_path: z
    .string()
    .min(3, "Select your target career path"),

  skills: z.string().refine(
    (value) =>
      value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean).length >= 2,
    "Add at least 2 skills"
  ),
});

type FormValues = z.infer<typeof schema>;

export default function OnboardingScreen() {
  const { session, setOnboardingCompleted } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { control, handleSubmit, reset, watch } =
    useForm<FormValues>({
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
      preferred_career_path:
        profileQuery.data.preferred_career_path ?? "",
      skills: (skillsQuery.data ?? [])
        .map((s) => s.name)
        .join(", "),
    });
  }, [profileQuery.data, reset, skillsQuery.data]);

  const values = watch();

  const progress = useMemo(() => {
    const fields = [
      values.full_name,
      values.education,
      values.skills,
      values.interests,
      values.projects,
      values.certifications,
      values.resume_text,
      values.preferred_career_path,
    ];

    const completed = fields.filter(
      (field) => field && field.trim().length > 0
    ).length;

    return {
      completed,
      total: fields.length,
      percentage: Math.round((completed / fields.length) * 100),
    };
  }, [values]);

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
        certifications: values.certifications
          .split(",")
          .map((v) => v.trim()),
        skills: values.skills.split(",").map((v) => v.trim()),
      });

      setOnboardingCompleted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 24 }}
      >
        <GlassCard>
          <Text className="text-3xl font-bold text-zinc-100">
            Complete your profile
          </Text>

          <Text className="mt-2 text-zinc-400">
            Help us build your personalized career roadmap.
          </Text>

          <View className="mt-6">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-medium text-cyan-300">
                Profile Completion
              </Text>

              <Text className="text-sm font-semibold text-cyan-300">
                {progress.percentage}%
              </Text>
            </View>

            <View className="h-3 overflow-hidden rounded-full bg-slate-800">
              <View
                className="h-full rounded-full bg-cyan-400"
                style={{
                  width: `${progress.percentage}%`,
                }}
              />
            </View>

            <Text className="mt-2 text-xs text-slate-400">
              {progress.completed} of {progress.total} required sections
              completed
            </Text>
          </View>

          {profileQuery.isLoading || skillsQuery.isLoading ? (
            <ActivityIndicator
              color="#22D3EE"
              className="my-6"
            />
          ) : null}
          <Text className="mt-8 mb-3 text-lg font-semibold text-cyan-300">
              Personal Information
          </Text>
          <Controller
            control={control}
            name="full_name"
            render={({ field: { value, onChange }, fieldState }) => (
              <AppInput
                label="Full name"
                placeholder="Dhruv Sharma"
                value={value}
                onChangeText={onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="education"
            render={({ field: { value, onChange }, fieldState }) => (
              <AppInput
                label="Education"
                placeholder="B.Tech CSE, Semester 4"
                value={value}
                onChangeText={onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Text className="mt-6 mb-3 text-lg font-semibold text-cyan-300">
            Skills & Interests
          </Text>
          <Controller
            control={control}
            name="skills"
            render={({ field: { value, onChange }, fieldState }) => (
              <AppInput
                label="Skills (comma-separated)"
                placeholder="React, TypeScript, SQL"
                value={value}
                onChangeText={onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="interests"
            render={({ field: { value, onChange }, fieldState }) => (
              <AppInput
                label="Interests"
                placeholder="AI, Product Development"
                value={value}
                onChangeText={onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Text className="mt-6 mb-3 text-lg font-semibold text-cyan-300">
            Experience
          </Text>
          <Controller
            control={control}
            name="projects"
            render={({ field: { value, onChange }, fieldState }) => (
              <AppInput
                label="Projects"
                placeholder="SkillSync MVP, Campus Portal"
                value={value}
                onChangeText={onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="certifications"
            render={({ field: { value, onChange }, fieldState }) => (
              <AppInput
                label="Certifications"
                placeholder="AWS CCP, Meta RN"
                value={value}
                onChangeText={onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Text className="mt-6 mb-3 text-lg font-semibold text-cyan-300">
            Resume Summary
          </Text>
          <Controller
            control={control}
            name="resume_text"
            render={({ field: { value, onChange }, fieldState }) => (
              <AppInput
                label="Resume summary"
                placeholder="A concise summary of your resume..."
                value={value}
                onChangeText={onChange}
                multiline
                error={fieldState.error?.message}
              />
            )}
          />
          <Text className="mt-6 mb-3 text-lg font-semibold text-cyan-300">
            Professional Presence
          </Text>
          <Controller
            control={control}
            name="github_url"
            render={({ field: { value, onChange }, fieldState }) => (
              <AppInput
                label="GitHub URL (optional)"
                placeholder="https://github.com/username"
                value={value}
                onChangeText={onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="linkedin_url"
            render={({ field: { value, onChange }, fieldState }) => (
              <AppInput
                label="LinkedIn URL (optional)"
                placeholder="https://linkedin.com/in/username"
                value={value}
                onChangeText={onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Text className="mt-6 mb-3 text-lg font-semibold text-cyan-300">
            Career Goals
          </Text>
          <Controller
            control={control}
            name="preferred_career_path"
            render={({ field: { value, onChange }, fieldState }) => (
              <AppInput
                label="Preferred career"
                placeholder="Frontend Engineer"
                value={value}
                onChangeText={onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          {error ? (
            <Text className="mb-3 text-sm text-rose-400">
              {error}
            </Text>
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