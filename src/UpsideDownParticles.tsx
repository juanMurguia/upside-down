import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function UpsideDownParticles() {
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
    if (!particlesRef.current) {
      return;
    }

    const pos = particlesRef.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3 + 2] += velocities[i * 3 + 2];

      if (pos[i * 3 + 1] > 50) pos[i * 3 + 1] = -50;
      if (Math.abs(pos[i * 3]) > 50) pos[i * 3] *= -1;
      if (Math.abs(pos[i * 3 + 2]) > 50) pos[i * 3 + 2] *= -1;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
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
      <pointsMaterial size={0.15} color="#8c9bb2" transparent opacity={0.6} />
    </points>
  );
}
