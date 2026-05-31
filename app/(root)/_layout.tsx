import { Redirect, Stack, usePathname } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuthStore } from "@/store/auth-store";

export default function ProtectedLayout() {
  const {
    session,
    loading,
    onboardingCompleted,
    editingOnboarding,
  } = useAuthStore();

  const pathname = usePathname();

  const inAuth =
    pathname.includes("/login") ||
    pathname.includes("/signup") ||
    pathname.includes("/forgot-password");

  const inOnboarding =
    pathname.includes("/onboarding");

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#A78BFA" />
      </View>
    );
  }

  if (!session && !inAuth) {
    return <Redirect href="/login" />;
  }

  if (
    session &&
    !onboardingCompleted &&
    !inOnboarding
  ) {
    return <Redirect href="/onboarding" />;
  }

  if (
    session &&
    onboardingCompleted &&
    (inAuth ||
      (inOnboarding && !editingOnboarding))
  ) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}