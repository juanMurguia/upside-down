import * as THREE from "three";

export default function SkyDome() {
  return (
    <mesh scale={500} renderOrder={-100}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial
        color="#36060f"
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
