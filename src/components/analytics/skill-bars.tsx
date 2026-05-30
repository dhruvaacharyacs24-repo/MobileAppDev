import { Text, View } from "react-native";

type Props = {
  skills: string[];
};

export const SkillBars = ({ skills }: Props) => (
  <View className="gap-3">
    {skills.map((skill, index) => {
      const pct = 90 - index * 12;
      return (
        <View key={skill}>
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-sm text-zinc-200">{skill}</Text>
            <Text className="text-xs text-zinc-400">{pct}% demand</Text>
          </View>
          <View className="h-2 rounded-full bg-zinc-800">
            <View className="h-2 rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
          </View>
        </View>
      );
    })}
  </View>
);
