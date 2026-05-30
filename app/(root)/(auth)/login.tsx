import { useState } from "react";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Sparkles } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { z } from "zod";
import { LinearGradient } from "expo-linear-gradient";

import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientScreen } from "@/components/ui/gradient-screen";
import { authService } from "@/services/auth-service";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setAuthError("");

    const { error } = await authService.signIn(values.email, values.password);

    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    // NO router.replace("/")
    // Let auth state + layout redirects handle navigation
  };

  return (
    <GradientScreen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(500)}>
            <LinearGradient
              colors={["rgba(139,92,246,0.22)", "rgba(6,182,212,0.15)", "rgba(15,23,42,0.75)"]}
              className="mb-4 rounded-3xl p-5"
            >
              <Text className="text-xs uppercase tracking-widest text-cyan-200">SkillSync AI</Text>
              <Text className="mt-2 text-2xl font-bold text-slate-100">
                Build your market-ready career profile
              </Text>
              <Text className="mt-1 text-slate-300">
                Personalized analysis, real-time demand, actionable roadmap.
              </Text>
            </LinearGradient>

            <GlassCard>
              <View className="mb-5">
                <View className="mb-3 w-10 rounded-full bg-violet-600/20 p-2">
                  <Sparkles color="#C4B5FD" size={18} />
                </View>

                <Text className="mb-1 text-3xl font-bold text-slate-100">
                  Welcome back
                </Text>

                <Text className="text-slate-400">
                  Sign in to continue your AI-driven career journey.
                </Text>
              </View>

              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange } }) => (
                  <AppInput
                    label="Email"
                    placeholder="you@example.com"
                    value={value}
                    onChangeText={onChange}
                    error={formState.errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { value, onChange } }) => (
                  <AppInput
                    label="Password"
                    placeholder="********"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showPassword}
                    error={formState.errors.password?.message}
                    rightNode={
                      <Pressable onPress={() => setShowPassword((v) => !v)}>
                        {showPassword ? (
                          <EyeOff color="#A1A1AA" size={18} />
                        ) : (
                          <Eye color="#A1A1AA" size={18} />
                        )}
                      </Pressable>
                    }
                  />
                )}
              />

              {authError ? (
                <Text className="mb-4 text-sm text-rose-300">{authError}</Text>
              ) : null}

              <AppButton
                label="Login"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
              />

              <View className="mt-5 flex-row justify-between">
                <Link href="/forgot-password" asChild>
                  <Pressable>
                    <Text className="text-slate-400">Forgot password?</Text>
                  </Pressable>
                </Link>

                <Link href="/signup" asChild>
                  <Pressable>
                    <Text className="font-semibold text-cyan-300">
                      Create account
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}