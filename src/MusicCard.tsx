import { Edges, Html, RoundedBox, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Track } from "./tracks";

const DEFAULT_COVER =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22640%22%20height%3D%22640%22%3E%3Crect%20width%3D%22640%22%20height%3D%22640%22%20fill%3D%22%230b0f1c%22/%3E%3C/svg%3E";

type MusicCardProps = {
  track: Track | null;
  visible: boolean;
};

export default function MusicCard({ track, visible }: MusicCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { gl, viewport } = useThree();
  const coverUrl = track?.coverUrl || DEFAULT_COVER;
  const texture = useTexture(coverUrl);
  const basePosition = useMemo(() => new THREE.Vector3(0, 2, 24), []);
  const baseRotation = useMemo(() => new THREE.Euler(0, 0, 0), []);
  const cardScale = Math.min(1, viewport.width / 12);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
  }, [gl, texture]);

  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!groupRef.current || !visible) return;

    // Smooth pointer tracking
    pointer.current.x += (state.pointer.x - pointer.current.x) * 0.05;
    pointer.current.y += (state.pointer.y - pointer.current.y) * 0.05;

    const t = state.clock.getElapsedTime();
    const floatY = Math.sin(t * 0.9) * 0.6;
    const drift = Math.sin(t * 0.35) * 0.1;
    const pointerX = THREE.MathUtils.clamp(pointer.current.x, -0.7, 0.7);
    const pointerY = THREE.MathUtils.clamp(pointer.current.y, -0.5, 0.5);

    groupRef.current.position.set(
      basePosition.x,
      basePosition.y + floatY,
      basePosition.z
    );
    groupRef.current.rotation.set(
      baseRotation.x + pointerY * -0.18 + Math.sin(t * 0.45) * 0.04,
      baseRotation.y + pointerX * 0.25 + drift,
      baseRotation.z
    );
  });

  if (!track || !visible) {
    return null;
  }

  return (
    <group ref={groupRef} scale={[cardScale, cardScale, cardScale]}>
      <RoundedBox args={[8.2, 5.3, 0.38]} radius={0.45} smoothness={6}>
        <meshStandardMaterial
          color="#4e0202"
          metalness={0.6}
          roughness={0.25}
          emissive="#d02424"
          emissiveIntensity={3}
        />
        <Edges color="#ff2f3c" isMesh />
      </RoundedBox>
      <mesh position={[-1.9, 0.05, 0.25]}>
        <planeGeometry args={[3.4, 3.4]} />
        <meshStandardMaterial map={texture} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[-1.9, 0.05, 0.22]}>
        <planeGeometry args={[3.6, 3.6]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
      </mesh>
      <Html transform position={[1.7, 0.3, 0.26]} distanceFactor={7.8}>
        <div className="music-card__html">
          <div className="music-card__label">Preview</div>
          <div className="music-card__title">{track.title}</div>
          <div className="music-card__artist">{track.artist}</div>
          <div className="music-card__year">{track.year}</div>
        </div>
      </Html>
    </group>
  );
}
