import * as THREE from "three";

export default function SkyDome() {
  return (
    <mesh scale={500} renderOrder={-100}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial
        color="#061f36"
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
