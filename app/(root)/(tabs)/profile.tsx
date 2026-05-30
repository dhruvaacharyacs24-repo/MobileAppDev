import { ScrollView, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { BookOpenText, BriefcaseBusiness, GraduationCap, Mail } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { AppButton } from "@/components/ui/app-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientScreen } from "@/components/ui/gradient-screen";
import { authService } from "@/services/auth-service";
import { profileService } from "@/services/profile-service";
import { useAuthStore } from "@/store/auth-store";

export default function ProfileScreen() {
  const { session, setOnboardingCompleted } = useAuthStore();
  const userId = session?.user.id ?? "";
  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => profileService.getProfile(userId),
    enabled: Boolean(userId),
  });

  return (
    <GradientScreen>
      <ScrollView className="flex-1 pt-4">
        <LinearGradient
          colors={["rgba(139,92,246,0.2)", "rgba(14,165,233,0.14)", "rgba(15,23,42,0.65)"]}
          className="mb-4 rounded-3xl p-4"
        >
          <Text className="text-xs uppercase tracking-widest text-slate-300">Profile Health</Text>
          <Text className="mt-1 text-lg font-semibold text-white">
            Keep your profile updated weekly to maintain accurate AI recommendations.
          </Text>
        </LinearGradient>
        <GlassCard className="mb-4">
          <Text className="text-2xl font-bold text-zinc-100">{profileQuery.data?.full_name ?? "Student"}</Text>
          <Text className="mt-1 text-zinc-400">Personal profile & career snapshot</Text>
          <View className="mt-4 flex-row gap-2">
            <View className="rounded-full bg-zinc-800 px-3 py-1">
              <Text className="text-xs text-zinc-300">Active Profile</Text>
            </View>
            <View className="rounded-full bg-cyan-900/40 px-3 py-1">
              <Text className="text-xs text-cyan-300">SkillSync AI</Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard className="mb-4">
          <View className="mb-2 flex-row items-center gap-2">
            <Mail color="#22D3EE" size={16} />
            <Text className="text-zinc-200">Email</Text>
          </View>
          <Text className="mb-3 text-zinc-400">{session?.user.email}</Text>

          <View className="mb-2 flex-row items-center gap-2">
            <GraduationCap color="#A78BFA" size={16} />
            <Text className="text-zinc-200">Education</Text>
          </View>
          <Text className="mb-3 text-zinc-400">{profileQuery.data?.education ?? "Not set"}</Text>

          <View className="mb-2 flex-row items-center gap-2">
            <BriefcaseBusiness color="#34D399" size={16} />
            <Text className="text-zinc-200">Preferred Career</Text>
          </View>
          <Text className="text-zinc-400">{profileQuery.data?.preferred_career_path ?? "Not set"}</Text>
        </GlassCard>

        <GlassCard className="mb-4">
          <Text className="mb-2 text-zinc-200">GitHub</Text>
          <Text className="mb-3 text-zinc-400">{profileQuery.data?.github_url || "Not provided"}</Text>

          <Text className="mb-2 text-zinc-200">LinkedIn</Text>
          <Text className="mb-3 text-zinc-400">{profileQuery.data?.linkedin_url || "Not provided"}</Text>

          <View className="mb-2 flex-row items-center gap-2">
            <BookOpenText color="#F59E0B" size={16} />
            <Text className="text-zinc-200">Resume Summary</Text>
          </View>
          <Text className="text-zinc-400">{profileQuery.data?.resume_text || "Not provided"}</Text>
        </GlassCard>

        <View className="mb-8 gap-3">
          <AppButton
            label="Edit onboarding data"
            onPress={() => {
              setOnboardingCompleted(false);
            }}
            variant="secondary"
          />
          <AppButton
            label="Logout"
            onPress={async () => {
              await authService.signOut();
            }}
          />
        </View>
      </ScrollView>
    </GradientScreen>
  );
}
