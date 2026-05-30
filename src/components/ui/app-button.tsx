import { ActivityIndicator, Pressable, Text } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary";
};

export const AppButton = ({ label, onPress, loading, variant = "primary" }: Props) => (
  <Pressable
    onPress={onPress}
    disabled={loading}
    style={({ pressed }) => ({
      transform: [{ scale: pressed ? 0.98 : 1 }],
      opacity: pressed ? 0.9 : 1,
    })}
    className={`items-center rounded-2xl border px-4 py-4 ${
      variant === "primary"
        ? "border-amber-300/40 bg-amber-500/90"
        : "border-slate-500/60 bg-slate-800/80"
    }`}
  >
    {loading ? (
      <ActivityIndicator color="white" />
    ) : (
      <Text className="text-base font-semibold tracking-wide text-zinc-100">{label}</Text>
    )}
  </Pressable>
);
