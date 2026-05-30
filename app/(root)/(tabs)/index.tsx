import { useQuery } from "@tanstack/react-query";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { BriefcaseBusiness, Newspaper, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { GlassCard } from "@/components/ui/glass-card";
import { GradientScreen } from "@/components/ui/gradient-screen";
import { marketService } from "@/services/market-service";
import { profileService } from "@/services/profile-service";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardScreen() {
  const { session } = useAuthStore();
  const userId = session?.user.id ?? "";

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => profileService.getProfile(userId),
    enabled: Boolean(userId),
  });
  const newsQuery = useQuery({
    queryKey: ["news"],
    queryFn: marketService.getMarketNews,
  });

  return (
    <GradientScreen>
      <ScrollView
        className="flex-1 pt-4"
        refreshControl={<RefreshControl refreshing={profileQuery.isRefetching || newsQuery.isRefetching} onRefresh={() => {
          profileQuery.refetch();
          newsQuery.refetch();
        }} />}
      >
        <Text className="mb-5 text-3xl font-bold text-zinc-100">
          Hi {profileQuery.data?.full_name?.split(" ")[0] ?? "Student"}
        </Text>
        <Text className="mb-4 text-slate-300">Track your readiness with live market intelligence.</Text>

        <LinearGradient
          colors={["rgba(59,130,246,0.18)", "rgba(139,92,246,0.2)", "rgba(6,182,212,0.15)"]}
          className="mb-4 rounded-3xl p-4"
        >
          <Text className="text-xs uppercase tracking-widest text-slate-300">Today</Text>
          <Text className="mt-1 text-xl font-bold text-white">Stay consistent: 30 mins learning + 1 project commit</Text>
        </LinearGradient>

        <GlassCard className="mb-4">
          <View className="flex-row items-center gap-2">
            <BriefcaseBusiness color="#22D3EE" size={18} />
            <Text className="text-lg font-semibold text-zinc-100">Career Path</Text>
          </View>
          <Text className="mt-2 text-zinc-300">{profileQuery.data?.preferred_career_path ?? "Set in onboarding"}</Text>
        </GlassCard>

        <View className="mb-4 flex-row gap-3">
          <GlassCard className="flex-1">
            <Text className="text-xs uppercase tracking-widest text-zinc-500">Profile</Text>
            <Text className="mt-2 text-xl font-bold text-cyan-300">{profileQuery.data ? "Ready" : "Pending"}</Text>
          </GlassCard>
          <GlassCard className="flex-1">
            <Text className="text-xs uppercase tracking-widest text-zinc-500">Market Feed</Text>
            <Text className="mt-2 text-xl font-bold text-violet-300">{newsQuery.data?.length ?? 0} items</Text>
          </GlassCard>
        </View>

        <GlassCard className="mb-4">
          <View className="mb-2 flex-row items-center gap-2">
            <Newspaper color="#A78BFA" size={18} />
            <Text className="text-lg font-semibold text-zinc-100">Live market updates</Text>
          </View>
          {newsQuery.isLoading ? <Text className="mb-2 text-sm text-zinc-400">Fetching latest API updates...</Text> : null}
          {newsQuery.isError ? (
            <Text className="mb-2 text-sm text-rose-400">{(newsQuery.error as Error).message}</Text>
          ) : null}
          {(newsQuery.data ?? []).map((item: { title: string }, idx: number) => (
            <Text key={`${item.title}-${idx}`} className="mb-2 text-sm text-zinc-300">
              • {item.title}
            </Text>
          ))}
          {!newsQuery.data?.length && !newsQuery.isLoading ? (
            <Text className="text-zinc-500">No live updates returned from News API right now.</Text>
          ) : null}
        </GlassCard>

        <GlassCard className="mb-4">
          <View className="flex-row items-center gap-2">
            <Sparkles color="#34D399" size={18} />
            <Text className="text-lg font-semibold text-zinc-100">Quick Insight</Text>
          </View>
          <Text className="mt-2 text-zinc-300">
            Keep your projects outcome-focused and align your skill stack with live demand trends for faster placement readiness.
          </Text>
        </GlassCard>

        <View className="h-8" />
      </ScrollView>
    </GradientScreen>
  );
}
