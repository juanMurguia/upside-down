import { Cloud, Clouds } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type CloudLayerProps = {
  variant?: "rift" | "day";
};

const cloudPresets = {
  rift: [
    { color: "#030813", opacity: 1.15, seed: 0.4, volume: 100, position: [0, 0, 0] },
    { color: "#760d30", opacity: 1.15, seed: 0.3, volume: 300, position: [400, 0, 0] },
    { color: "#4f1126", opacity: 1.15, seed: 0.3, volume: 300, position: [-400, 0, 0] },
  ],
  day: [
    { color: "#f4fbff", opacity: 0.65, seed: 0.6, volume: 220, position: [0, 0, 0] },
    { color: "#d9f0ff", opacity: 0.6, seed: 0.4, volume: 260, position: [340, 0, 0] },
    { color: "#cbe6f9", opacity: 0.55, seed: 0.5, volume: 240, position: [-340, 0, 0] },
  ],
} as const;

export default function CloudLayer({ variant = "rift" }: CloudLayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const clouds = useMemo(() => cloudPresets[variant], [variant]);

  return (
    <group ref={groupRef}>
      <Clouds
        material={THREE.MeshLambertMaterial}
        limit={variant === "day" ? 80 : 100}
        range={variant === "day" ? 140 : 100}
        position={[0, 400, variant === "day" ? -420 : -500]}
      >
        {clouds.map((cloud) => (
          <Cloud
            key={`${cloud.color}-${cloud.position[0]}`}
            concentrate="outside"
            growth={variant === "day" ? 420 : 500}
            color={cloud.color}
            opacity={cloud.opacity}
            seed={cloud.seed}
            bounds={variant === "day" ? 240 : 200}
            volume={cloud.volume}
            position={cloud.position as [number, number, number]}
          />
        ))}
      </Clouds>
    </group>
  );
}
