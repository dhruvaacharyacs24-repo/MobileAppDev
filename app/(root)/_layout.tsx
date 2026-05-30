import { Redirect, Stack, usePathname } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { useAuthStore } from "@/store/auth-store";

export default function ProtectedLayout() {
  const { session, loading, onboardingCompleted } = useAuthStore();
  const pathname = usePathname();
  const inAuth =
    pathname.includes("/login") || pathname.includes("/signup") || pathname.includes("/forgot-password");
  const inOnboarding = pathname.includes("/onboarding");

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7688/ingest/8e61f5bc-1219-4ad9-a432-ae08fa2ba365",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"501c1c"},body:JSON.stringify({sessionId:"501c1c",runId:"pre-fix",hypothesisId:"H5",location:"(root)/_layout.tsx:state-change",message:"layout auth state changed",data:{pathname,isAuthenticated:Boolean(session),loading,onboardingCompleted,inAuth,inOnboarding},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [inAuth, inOnboarding, loading, onboardingCompleted, pathname, session]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#A78BFA" />
      </View>
    );
  }

  if (!session && !inAuth) return <Redirect href="/login" />;
  if (session && !onboardingCompleted && !inOnboarding) return <Redirect href="/onboarding" />;
  if (session && onboardingCompleted && (inAuth || inOnboarding)) {
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
