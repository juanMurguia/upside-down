import { Sparkles } from "@react-three/drei";
import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { Suspense } from "react";
import CloudLayer from "./CloudLayer";
import RedStormLights from "./RedStormLights";
import SkyDome from "./SkyDome";
import UpsideDownParticles from "./UpsideDownParticles";

export default function Scene() {
  return (
    <>
      <SkyDome />
      <fogExp2 attach="fog" args={["#061f36", 0.0045]} />
      <ambientLight intensity={0.04} color="#0b1224" />
      <directionalLight
        position={[10, 30, 10]}
        intensity={0.65}
        color="#2f6bff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-20, 10, -20]}
        intensity={0.18}
        color="#111827"
      />
      <UpsideDownParticles />
      <Suspense fallback={null}>
        <CloudLayer />
      </Suspense>
      <RedStormLights />
      <Sparkles
        count={420}
        scale={[120, 70, 120]}
        size={1.4}
        speed={0.2}
        color="#9eb0cc"
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -20, 0]}
        receiveShadow
      >
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial
          color="#07070c"
          roughness={1}
          metalness={0}
          emissive="#02020a"
          emissiveIntensity={0.2}
        />
      </mesh>
      <EffectComposer>
        <Bloom
          intensity={1.15}
          luminanceThreshold={0.08}
          luminanceSmoothing={0.9}
        />
        <Noise opacity={0.1} />
        <Vignette darkness={0.75} offset={0.3} />
      </EffectComposer>
    </>
  );
}
