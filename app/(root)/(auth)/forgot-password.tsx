import { useState } from "react";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { z } from "zod";

import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientScreen } from "@/components/ui/gradient-screen";
import { authService } from "@/services/auth-service";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: FormValues) => {
    setLoading(true);
    const { error } = await authService.resetPassword(email);
    setMessage(error ? error.message : "Reset link sent to your email.");
    setLoading(false);
  };

  return (
    <GradientScreen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <GlassCard>
          <Text className="mb-1 text-2xl font-bold text-zinc-100">Reset password</Text>
          <Text className="mb-4 text-zinc-400">We will email reset instructions.</Text>
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
          {message ? <Text className="mb-4 text-sm text-cyan-400">{message}</Text> : null}
          <AppButton label="Send reset link" onPress={handleSubmit(onSubmit)} loading={loading} />
          <View className="mt-4">
            <AppButton label="Back to login" onPress={() => router.replace("/login")} variant="secondary" />
          </View>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}
