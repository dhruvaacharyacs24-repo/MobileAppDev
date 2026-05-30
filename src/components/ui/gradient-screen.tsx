import { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = { children: ReactNode };

export const GradientScreen = ({ children }: Props) => (
  <LinearGradient colors={["#030712", "#111827", "#1E1B4B"]} className="flex-1">
    <SafeAreaView className="flex-1 px-6">{children}</SafeAreaView>
  </LinearGradient>
);
