import React from "react";
import { Pressable, View, Text, ViewStyle, useColorScheme } from "react-native";
import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;          // height of the icon, text scales with it
  style?: ViewStyle;
  onPress?: () => void;
};

function HelixIcon({ size = 28 }: { size?: number }) {
  const h = size;
  const w = Math.round(size * 0.9);
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      {/* left strand */}
      <Path
        d={`M 2 ${h*0.1} C ${w*0.35} ${h*0.25}, ${w*0.35} ${h*0.75}, 2 ${h*0.9}`}
        stroke="#0b63ce"
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
      />
      {/* right strand */}
      <Path
        d={`M ${w-2} ${h*0.1} C ${w*0.65} ${h*0.25}, ${w*0.65} ${h*0.75}, ${w-2} ${h*0.9}`}
        stroke="#22c55e"
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
      />
      {/* rungs */}
      <Path
        d={
          [0.2,0.35,0.5,0.65,0.8]
            .map(t => `M 4 ${h*t} L ${w-4} ${h*t}`)
            .join(" ")
        }
        stroke="#7c8aa6"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * Wordmark next to helix using RN Text:
 * - Better kerning than SvgText
 * - Uses your loaded fonts (e.g., SpaceMono / system)
 */
export default function Logo({ size = 28, style, onPress }: Props) {
  const scheme = useColorScheme();
  const blue = "#0b63ce";
  const dark = scheme === "dark" ? "#e5e7eb" : "#0f172a";

  // scale text based on icon size
  const fontSize = Math.round(size * 0.8);
  const gap = Math.round(size * 0.35);

  const content = (
    <View style={[{ flexDirection: "row", alignItems: "center" }, style]}>
      <HelixIcon size={size} />
      <View style={{ width: gap }} />
      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
        <Text
          style={{
            fontSize,
            fontWeight: "800",
            color: blue,
            letterSpacing: -0.3,
          }}
        >
          Bio
        </Text>
        <Text
          style={{
            fontSize,
            fontWeight: "800",
            color: blue,
            letterSpacing: -0.3,
          }}
        >
          Bits
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }, style]}
        accessibilityRole="button"
        accessibilityLabel="Go to Home"
      >
        {content}
      </Pressable>
    );
  }
  return content;
}
