import { ReactNode } from "react";
import { Text, TextInput, View } from "react-native";

type Props = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  rightNode?: ReactNode;
  multiline?: boolean;
  error?: string;
};

export const AppInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  rightNode,
  multiline,
  error,
}: Props) => (
  <View className="mb-4">
    <Text className="mb-2 text-sm font-medium text-slate-300">{label}</Text>
    <View className="flex-row items-center rounded-2xl border border-slate-600/60 bg-slate-900/80 px-4">
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        className="flex-1 py-4 text-base text-slate-100"
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {rightNode}
    </View>
    {error ? <Text className="mt-1 text-xs text-rose-400">{error}</Text> : null}
  </View>
);
