import { Billboard } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

const GLOW_COLOR = new THREE.Color("#ff2e3a");

const glowConfigs = [
  { position: [-20, 6, -24], size: 16, intensity: 2.4, opacity: 0.6 },
  { position: [16, 8, -28], size: 20, intensity: 2.8, opacity: 0.65 },
  { position: [4, 12, -38], size: 26, intensity: 3.2, opacity: 0.55 },
];

function createGlowTexture() {
  if (typeof document === "undefined") {
    return null;
  }

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const center = size / 2;
  const gradient = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    size * 0.5
  );
  gradient.addColorStop(0, "rgba(255,120,120,1)");
  gradient.addColorStop(0.35, "rgba(255,70,80,0.7)");
  gradient.addColorStop(0.7, "rgba(255,40,50,0.25)");
  gradient.addColorStop(1, "rgba(255,20,40,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function RedStormLights() {
  const glowTexture = useMemo(createGlowTexture, []);

  return (
    <>
      {glowConfigs.map((glow) => (
        <group key={glow.position.join("-")} position={glow.position}>
          <pointLight
            color={GLOW_COLOR}
            intensity={glow.intensity}
            distance={70}
            decay={2}
          />
          <Billboard>
            <mesh scale={[glow.size, glow.size, 1]}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial
                map={glowTexture ?? undefined}
                color={GLOW_COLOR}
                transparent
                opacity={glow.opacity}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </Billboard>
        </group>
      ))}
    </>
  );
}
