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

// Lightning Bolts
function Lightning() {
  const lightningRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    lightningRefs.current.forEach((bolt) => {
      if (bolt) {
        const flash = Math.random() > 0.97;
        bolt.visible = flash;
      }
    });
  });

  const boltPositions = useMemo(() => {
    return Array.from({ length: 5 }, () => ({
      x: (Math.random() - 0.5) * 60,
      y: Math.random() * 40 - 20,
      z: (Math.random() - 0.5) * 60,
      rotation: Math.random() * Math.PI,
    }));
  }, []);

  return (
    <>
      {boltPositions.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => (lightningRefs.current[i] = el)}
          position={[pos.x, pos.y, pos.z]}
          rotation={[0, 0, pos.rotation]}
        >
          <cylinderGeometry args={[0.1, 0.1, 30, 8]} />
          <meshStandardMaterial
            color="#4488ff"
            emissive="#4488ff"
            emissiveIntensity={3}
          />
        </mesh>
      ))}
    </>
  );
}

function VolumetricBeam() {
  return (
    <mesh
      position={[0, 11, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={10}
    >
      {/* radius, height */}
      <coneGeometry args={[6, 22, 64, 1, true]} />
      <meshBasicMaterial
        color="#ff3333"
        transparent
        opacity={0.1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Main Scene
function Scene() {
  return (
    <>
      <color attach="background" args={["#02040b"]} />
      {/* Fog */}
      <fogExp2 attach="fog" args={["#05060d", 0.01]} />
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
