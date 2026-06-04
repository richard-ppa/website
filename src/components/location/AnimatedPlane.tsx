import { PlaneGlyph } from "./PlaneGlyph";

interface AnimatedPlaneProps {
  /** Animation pace. "rich" = 9s loop, "medium" = 14s, "subtle" = 22s. */
  intensity?: "rich" | "medium" | "subtle";
}

const SPEEDS = { rich: 9, medium: 14, subtle: 22 };

export function AnimatedPlane({ intensity = "rich" }: AnimatedPlaneProps) {
  const dur = SPEEDS[intensity];
  // Diagonal glide-path approaching from the north-west, descending toward the
  // runway. Coordinates are in the original viewBox (0 0 1617.70215 1220.93567).
  const path = "M 644 279 L 1033 1470";
  return (
    <g filter="url(#kctp-plane-shadow)">
      <g>
        <animateMotion
          dur={`${dur}s`}
          repeatCount="indefinite"
          rotate="auto"
          path={path}
        />
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1.6;1.2;0.7;0.55;0.55"
          keyTimes="0;0.25;0.55;0.8;1"
          dur={`${dur}s`}
          repeatCount="indefinite"
          additive="sum"
        />
        <PlaneGlyph />
      </g>
    </g>
  );
}

interface ParkedPlaneProps {
  cx: number;
  cy: number;
}

export function ParkedPlane({ cx, cy }: ParkedPlaneProps) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(-18.03)`}>
      <g transform="scale(0.55)">
        <PlaneGlyph />
      </g>
    </g>
  );
}
