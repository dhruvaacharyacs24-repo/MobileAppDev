import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, Text } from "react-native";
import { BrainCircuit } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { ScoreRing } from "@/components/analytics/score-ring";
import { SkillBars } from "@/components/analytics/skill-bars";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientScreen } from "@/components/ui/gradient-screen";
import { aiService } from "@/services/ai-service";
import { marketService } from "@/services/market-service";
import { notificationService } from "@/services/notification-service";
import { profileService } from "@/services/profile-service";
import { useAuthStore } from "@/store/auth-store";

export default function AnalysisScreen() {
  const { session } = useAuthStore();
  const userId = session?.user.id ?? "";

  useEffect(() => {
    notificationService.setup();
  }, []);

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => profileService.getProfile(userId),
    enabled: Boolean(userId),
  });
  const skillsQuery = useQuery({
    queryKey: ["skills", userId],
    queryFn: async () => (await profileService.getSkills(userId)).map((s) => s.name),
    enabled: Boolean(userId),
  });
  const marketQuery = useQuery({
    queryKey: ["market", profileQuery.data?.preferred_career_path],
    queryFn: () => marketService.getJobDemand(profileQuery.data?.preferred_career_path ?? "Frontend Developer"),
    enabled: Boolean(profileQuery.data?.preferred_career_path),
  });

  const analysisQuery = useQuery({
    queryKey: ["analysis", userId, marketQuery.data?.role],
    queryFn: () =>
      aiService.analyze({
        profile: profileQuery.data!,
        skills: skillsQuery.data ?? [],
        market: marketQuery.data!,
      }),
    enabled: Boolean(profileQuery.data && marketQuery.data),
  });

  const analysis = analysisQuery.data;
  return (
    <GradientScreen>
      <ScrollView className="flex-1 pt-4">
        <LinearGradient
          colors={["rgba(16,185,129,0.18)", "rgba(6,182,212,0.12)", "rgba(15,23,42,0.6)"]}
          className="mb-4 rounded-3xl p-4"
        >
          <Text className="text-xs uppercase tracking-widest text-slate-300">AI Insight</Text>
          <Text className="mt-1 text-lg font-semibold text-white">
            Your readiness improves fastest when missing skills are practiced in project context.
          </Text>
        </LinearGradient>
        <GlassCard className="mb-4">
          <Text className="text-3xl font-bold text-zinc-100">AI Analysis</Text>
          <Text className="mt-1 text-zinc-400">Live market fit intelligence for your profile</Text>
        </GlassCard>
        {(profileQuery.isLoading || marketQuery.isLoading || analysisQuery.isLoading) ? (
          <GlassCard className="mb-4">
            <Text className="text-zinc-300">Generating your analysis...</Text>
          </GlassCard>
        ) : null}

        <GlassCard className="mb-4 items-center">
          <BrainCircuit color="#22D3EE" size={18} />
          <ScoreRing score={analysis?.readinessScore ?? 0} />
          <Text className="mt-4 text-zinc-300">Demand Score: {marketQuery.data?.demandScore ?? 0}</Text>
          <Text className="mt-1 text-xs text-zinc-500">Source: {marketQuery.data?.source ?? "N/A"}</Text>
        </GlassCard>

        <GlassCard className="mb-4">
          <Text className="text-xs uppercase tracking-widest text-zinc-500">Status</Text>
          <Text className="mt-2 text-zinc-300">
            {analysisQuery.isSuccess ? "Analysis generated successfully." : "Waiting for API response..."}
          </Text>
        </GlassCard>

        <GlassCard className="mb-4">
          <Text className="mb-3 text-lg font-semibold text-zinc-100">Top market skills</Text>
          <SkillBars skills={marketQuery.data?.topSkills ?? []} />
        </GlassCard>

        {[
          ["Strengths", analysis?.strengths ?? []],
          ["Weaknesses", analysis?.weaknesses ?? []],
          ["Missing Skills", analysis?.missingSkills ?? []],
          ["Roadmap", analysis?.roadmap ?? []],
          ["Recommendations", analysis?.recommendations ?? []],
          ["Resume ATS Analysis", analysis?.atsFeedback ?? []],
        ].map(([title, items]) => (
          <GlassCard key={title as string} className="mb-4">
            <Text className="mb-2 text-lg font-semibold text-zinc-100">{title as string}</Text>
            {(items as string[]).map((item) => (
              <Text key={item} className="mb-1 text-sm text-zinc-300">
                • {item}
              </Text>
            ))}
          </GlassCard>
        ))}
      </ScrollView>
    </GradientScreen>
  );
}
