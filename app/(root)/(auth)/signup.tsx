import { useState } from "react";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pressable, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { z } from "zod";

import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientScreen } from "@/components/ui/gradient-screen";
import { authService } from "@/services/auth-service";

const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function SignUpScreen() {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const { control, handleSubmit, formState } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        email: "",
        password: "",
        confirmPassword: "",
      },
    });

  const onSubmit = async (
    values: FormValues
  ) => {
    setLoading(true);
    setAuthError("");

    const { error } =
      await authService.signUp(
        values.email,
        values.password
      );

    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace("/login");
  };

  return (
    <GradientScreen>
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingVertical: 24,
          paddingBottom: 120,
        }}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={40}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard>
          <Text className="mb-1 text-3xl font-bold text-zinc-100">
            Create your account
          </Text>

          <Text className="mb-6 text-zinc-400">
            Build your profile and unlock
            market intelligence.
          </Text>

          <Controller
            control={control}
            name="email"
            render={({
              field: {
                value,
                onChange,
              },
            }) => (
              <AppInput
                label="Email"
                placeholder="you@example.com"
                value={value}
                onChangeText={onChange}
                error={
                  formState.errors.email
                    ?.message
                }
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({
              field: {
                value,
                onChange,
              },
            }) => (
              <AppInput
                label="Password"
                placeholder="******"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={
                  formState.errors.password
                    ?.message
                }
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({
              field: {
                value,
                onChange,
              },
            }) => (
              <AppInput
                label="Confirm password"
                placeholder="******"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={
                  formState.errors
                    .confirmPassword
                    ?.message
                }
              />
            )}
          />

          {authError ? (
            <Text className="mb-4 text-sm text-rose-400">
              {authError}
            </Text>
          ) : null}

          <AppButton
            label="Sign up"
            onPress={handleSubmit(
              onSubmit
            )}
            loading={loading}
          />

          <Link
            href="/login"
            asChild
          >
            <Pressable className="mt-4">
              <Text className="text-center text-zinc-400">
                Already have an account?
                Login
              </Text>
            </Pressable>
          </Link>
        </GlassCard>
      </KeyboardAwareScrollView>
    </GradientScreen>
  );
}