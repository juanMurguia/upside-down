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
  isPlaying: boolean;
};

export default function Scene({ activeTrack, showCard, isPlaying }: SceneProps) {
  const isBright = isPlaying;

  return (
    <>
      <SkyDome tone={isBright ? "day" : "rift"} />
      <fogExp2
        attach="fog"
        args={isBright ? ["#c9ecff", 0.0011] : ["#360608", 0.002]}
      />
      <ambientLight intensity={isBright ? 2.6 : 4} color={isBright ? "#f9fbff" : "#ff4b55"} />
      {isBright ? null : <SpikeRocks />}
      {isBright ? (
        <>
          <hemisphereLight
            intensity={1.4}
            color="#e8f6ff"
            groundColor="#b5d6ea"
          />
          <directionalLight
            position={[20, 40, 20]}
            intensity={2.8}
            color="#fff3d6"
            castShadow
          />
        </>
      ) : (
        <>
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
        </>
      )}
      {isBright ? null : <UpsideDownParticles />}
      <Suspense fallback={null}>
        <CloudLayer variant={isBright ? "day" : "rift"} />
        <MusicCard track={activeTrack} visible={showCard} />
      </Suspense>
      {isBright ? null : <RedStormLights />}
      <Sparkles
        count={isBright ? 180 : 420}
        scale={[120, 70, 120]}
        size={isBright ? 1 : 1.4}
        speed={isBright ? 0.05 : 0.2}
        color={isBright ? "#d8f2ff" : "#9eb0cc"}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -20, 0]}
        receiveShadow
      >
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial
          color={isBright ? "#8db7d5" : "#0c0707"}
          roughness={isBright ? 0.85 : 1}
          metalness={0}
          emissive={isBright ? "#6aa3c8" : "#0a0202"}
          emissiveIntensity={isBright ? 0.3 : 0.2}
        />
      </mesh>
      <EffectComposer>
        <Bloom
          intensity={isBright ? 0.6 : 1.2}
          luminanceThreshold={isBright ? 0.35 : 0.2}
          luminanceSmoothing={isBright ? 0.75 : 0.6}
          mipmapBlur
        />
        <Noise opacity={isBright ? 0.02 : 0.1} />
        <Vignette darkness={isBright ? 0.2 : 0.75} offset={0.3} />
      </EffectComposer>
    </>
  );
}
