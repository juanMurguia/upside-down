import * as THREE from "three";

const GLOW_COLOR = new THREE.Color("#ff2e3a");

const glowConfigs = [
  { position: [-20, 6, -24], radius: 10, intensity: 2.4, opacity: 0.25 },
  { position: [16, 8, -28], radius: 12, intensity: 2.8, opacity: 0.3 },
  { position: [4, 12, -38], radius: 16, intensity: 3.2, opacity: 0.22 },
];

export default function RedStormLights() {
  return (
    <>
      {glowConfigs.map((glow) => (
        <group key={glow.position.join("-")} position={glow.position}>
          <pointLight
            color={GLOW_COLOR}
            intensity={glow.intensity}
            distance={60}
            decay={2}
          />
          <mesh>
            <sphereGeometry args={[glow.radius, 32, 32]} />
            <meshBasicMaterial
              color={GLOW_COLOR}
              transparent
              opacity={glow.opacity}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}
