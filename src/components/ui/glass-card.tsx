import { ReactNode } from "react";
import { View } from "react-native";

type Props = {
  children: ReactNode;
  className?: string;
};

export const GlassCard = ({ children, className = "" }: Props) => (
  <View className={`rounded-3xl border border-indigo-300/10 bg-slate-900/75 p-5 shadow-2xl ${className}`}>
    {children}
  </View>
);
