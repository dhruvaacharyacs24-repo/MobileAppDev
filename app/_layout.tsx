import "../src/styles/global.css";
import "react-native-reanimated";

import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";

import { useAuthBootstrap } from "@/hooks/use-auth";
import { queryClient } from "@/lib/query-client";

export default function RootLayout() {
  useAuthBootstrap();

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(root)" />
      </Stack>
    </QueryClientProvider>
  );
}
