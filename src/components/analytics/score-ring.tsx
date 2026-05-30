import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = { score: number };

export const ScoreRing = ({ score }: Props) => {
  const radius = 48;
  const strokeWidth = 10;
  const circ = 2 * Math.PI * radius;
  const progress = (Math.max(0, Math.min(100, score)) / 100) * circ;

  return (
    <View className="items-center justify-center">
      <Svg width={120} height={120}>
        <Circle cx={60} cy={60} r={radius} stroke="#3F3F46" strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={60}
          cy={60}
          r={radius}
          stroke="#22D3EE"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${progress} ${circ - progress}`}
          strokeLinecap="round"
          rotation={-90}
          origin="60,60"
        />
      </Svg>
      <Text className="-mt-16 text-2xl font-bold text-zinc-100">{score}</Text>
      <Text className="text-xs text-zinc-400">Readiness</Text>
    </View>
  );
};
