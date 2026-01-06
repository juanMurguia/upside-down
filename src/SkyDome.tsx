import * as THREE from "three";

type SkyDomeProps = {
  tone?: "rift" | "day";
};

const skyColors = {
  rift: "#36060f",
  day: "#9ad8ff",
} as const;

export default function SkyDome({ tone = "rift" }: SkyDomeProps) {
  return (
    <mesh scale={500} renderOrder={-100}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial
        color={skyColors[tone]}
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
