import React from "react";
import { View } from "react-native";
import Svg, { Defs, G, Line, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  turns?: number;
  stroke?: number;
  colorA?: string;  
  colorB?: string;  
  rungColor?: string;
  tiltDeg?: number;
};

export default function HelixStripe({
  width = 360,
  height = 84,
  turns = 4.5,
  stroke = 3,
  colorA = "#0ea5e9",  
  colorB = "#6366f1",   
  rungColor = "#cbd5e1",
  tiltDeg = -5,
}: Props) {
  const W = width, H = height;
  const cx = W / 2, cy = H / 2;
  const amp = Math.min(H * 0.38, 30);
  const N = Math.max(120, Math.floor(W / 2)); 
  const omega = turns * 2 * Math.PI;

  const A: { x: number; y: number; t: number }[] = [];
  const B: { x: number; y: number; t: number }[] = [];

  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = t * W;
    const yA = cy + amp * Math.sin(omega * t);
    const yB = cy + amp * Math.sin(omega * t + Math.PI);
    A.push({ x, y: yA, t });
    B.push({ x, y: yB, t });
  }

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.reduce((d, p, i) => (i ? `${d} L${p.x},${p.y}` : `M${p.x},${p.y}`), "");

  const dA = toPath(A);
  const dB = toPath(B);

  const every = Math.max(6, Math.floor(N / (turns * 11)));

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="gradA" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colorA} stopOpacity={0.95} />
            <Stop offset="1" stopColor={colorB} stopOpacity={0.65} />
          </LinearGradient>
          <LinearGradient id="gradB" x1="1" y1="0" x2="0" y2="0">
            <Stop offset="0" stopColor={colorB} stopOpacity={0.95} />
            <Stop offset="1" stopColor={colorA} stopOpacity={0.65} />
          </LinearGradient>
        </Defs>

        <G transform={`rotate(${tiltDeg} ${cx} ${cy})`}>
          {A.map((pa, i) => {
            if (i % every !== 0) return null;
            const pb = B[i];
            const depth = 0.5 + 0.5 * Math.cos(omega * pa.t);
            const op = 0.35 + 0.35 * depth;         
            const w  = 1 + 1.2 * depth;             
            return (
              <Line
                key={`r-${i}`}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={rungColor}
                strokeOpacity={op}
                strokeWidth={w}
                strokeLinecap="round"
              />
            );
          })}

          <Path d={dA} stroke="url(#gradA)" strokeWidth={stroke} strokeLinecap="round" fill="none" />
          <Path d={dB} stroke="url(#gradB)" strokeWidth={stroke} strokeLinecap="round" fill="none" />
        </G>
      </Svg>
    </View>
  );
}