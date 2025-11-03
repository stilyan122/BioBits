// components/ProgressBar.tsx
import React, { useState } from "react";
import { View, ViewProps } from "react-native";

export default function ProgressBar({
  value,          // 0..1
  height = 6,
  bg = "#e5e9f2",
  fg = "#0b63ce",
  radius = 8,
  style,          // allow outer style passthrough
  ...rest
}: {
  value: number;
  height?: number;
  bg?: string;
  fg?: string;
  radius?: number;
} & ViewProps) {
  // Clamp to [0,1]
  const v = Math.max(0, Math.min(1, value));

  // Measured container width in px
  const [w, setW] = useState(0);

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[
        {
          width: "100%",
          height,
          backgroundColor: bg,
          borderRadius: radius,
          overflow: "hidden",
        },
        style,
      ]}
      {...rest}
    >
      <View
        // compute numeric pixel width to satisfy RN types
        style={{
          width: w * v,
          height: height, // numeric
          backgroundColor: fg,
        }}
      />
    </View>
  );
}