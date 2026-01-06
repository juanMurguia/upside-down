import { Sparkles } from "@react-three/drei";
import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { Suspense } from "react";
import CloudLayer from "./CloudLayer";
import MusicCard from "./MusicCard";
import RedStormLights from "./RedStormLights";
import SkyDome from "./SkyDome";
import SpikeRocks from "./SpikeRocks";
import UpsideDownParticles from "./UpsideDownParticles";
import type { Track } from "./tracks";

type SceneProps = {
  activeTrack: Track | null;
  showCard: boolean;
};

export default function Scene({ activeTrack, showCard }: SceneProps) {
  return (
    <>
      <SkyDome />
      <fogExp2 attach="fog" args={["#360608", 0.002]} />
      <ambientLight intensity={4} color="#ff4b55" />
      <SpikeRocks />
      <spotLight
        position={[0, 40, 0]}
        decay={0}
        distance={45}
        penumbra={1}
        intensity={100}
        color="#ff4b55"
      />
      <spotLight
        position={[-20, 0, 10]}
        color="#601111"
        angle={0.2}
        decay={0}
        penumbra={-1}
        intensity={10}
      />
      <spotLight
        position={[20, -40, 10]}
        color="#601111"
        angle={0.2}
        decay={0}
        penumbra={-1}
        intensity={10}
      />
      <spotLight
        position={[2, 10, 24]}
        color="#ff4b55"
        angle={0.5}
        penumbra={0.7}
        intensity={8}
        decay={1.2}
        distance={60}
      />
      <pointLight
        position={[8, 6, 20]}
        color="#ff4b55"
        intensity={3.2}
        decay={1.5}
        distance={50}
      />
      <UpsideDownParticles />
      <Suspense fallback={null}>
        <CloudLayer />
        <MusicCard track={activeTrack} visible={showCard} />
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
          color="#0c0707"
          roughness={1}
          metalness={0}
          emissive="#0a0202"
          emissiveIntensity={0.2}
        />
      </mesh>
      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.6}
          mipmapBlur
        />
        <Noise opacity={0.1} />
        <Vignette darkness={0.75} offset={0.3} />
      </EffectComposer>
    </>
  );
}
