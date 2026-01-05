import { Clouds, OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Floating Particles (Upside Down Spores)
function UpsideDownParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 500;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;

      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = Math.random() * 0.05 + 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    return [pos, vel];
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position.array;

      for (let i = 0; i < count; i++) {
        pos[i * 3] += velocities[i * 3];
        pos[i * 3 + 1] += velocities[i * 3 + 1];
        pos[i * 3 + 2] += velocities[i * 3 + 2];

        // Wrap around
        if (pos[i * 3 + 1] > 50) pos[i * 3 + 1] = -50;
        if (Math.abs(pos[i * 3]) > 50) pos[i * 3] *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 50) pos[i * 3 + 2] *= -1;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#8899aa" transparent opacity={0.6} />
    </points>
  );
}

function SkyDome() {
  return (
    <mesh scale={500} renderOrder={-100}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial
        color="#02040b"
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

// Main Scene
function Scene() {
  return (
    <>
      {/* Sky Dome */}
      <SkyDome />
      {/* Fog */}
      <fogExp2 attach="fog" args={["#05060d", 0.001]} />
      {/* Ambient Lighting */}
      <ambientLight intensity={0.1} color="#0d1117" />
      {/* Blue Directional Light */}
      <directionalLight position={[0, 40, 0]} intensity={0.5} color="#4488ff" />
      {/* Scene Elements */}
      <UpsideDownParticles />
      <Clouds position={[0, 8, -15]} limit={10} range={40} />{" "}
      <Sparkles
        count={300}
        scale={100}
        size={1.5}
        speed={0.2}
        color="#9999bb"
      />
      {/* Floor for reference */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -20, 0]}
        receiveShadow
      >
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#0a0a0f" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Post-processing Effects */}
      <EffectComposer>
        <Bloom
          intensity={2}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
        />
        <Noise opacity={0.1} />
        <Vignette darkness={0.7} offset={0.3} />
      </EffectComposer>
    </>
  );
}

// App Component
export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <Canvas camera={{ position: [0, 0, 40], fov: 75 }}>
        <OrbitControls
          enablePan={true}
          enableRotate={false}
          enableZoom={false}
        />
        <Scene />
      </Canvas>
    </div>
  );
}
