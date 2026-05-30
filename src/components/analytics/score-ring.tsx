import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  score: number;
};

export const ScoreRing = ({ score }: Props) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let current = 0;

    const interval = setInterval(() => {
      current += Math.max(1, Math.ceil(score / 30));

      if (current >= score) {
        current = score;
        clearInterval(interval);
      }

      setDisplayScore(current);
    }, 25);

    return () => clearInterval(interval);
  }, [score]);

  const radius = 56;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  const progress =
    (Math.max(0, Math.min(100, displayScore)) / 100) *
    circumference;

  const getTier = () => {
    if (score >= 85) {
      return {
        label: "ELITE",
        subtitle: "Top Candidate",
      };
    }

    if (score >= 70) {
      return {
        label: "READY",
        subtitle: "Market Ready",
      };
    }

    if (score >= 50) {
      return {
        label: "GROWING",
        subtitle: "Building Momentum",
      };
    }

    return {
      label: "BEGINNER",
      subtitle: "Needs Development",
    };
  };

  const tier = getTier();

  return (
    <View className="items-center justify-center py-2">
      <Svg width={150} height={150}>
        <Circle
          cx={75}
          cy={75}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        <Circle
          cx={75}
          cy={75}
          r={radius}
          stroke="#22D3EE"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${progress} ${
            circumference - progress
          }`}
          strokeLinecap="round"
          rotation={-90}
          origin="75,75"
        />
      </Svg>

      <View className="absolute items-center">
        <Text className="text-4xl font-extrabold text-zinc-100">
          {displayScore}
        </Text>

        <Text className="mt-1 text-xs font-bold tracking-[2px] text-cyan-300">
          {tier.label}
        </Text>
      </View>

      <Text className="mt-2 text-sm font-medium text-zinc-300">
        {tier.subtitle}
      </Text>
    </View>
  );
};