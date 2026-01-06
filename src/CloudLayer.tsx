import { Cloud, Clouds } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export default function CloudLayer() {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      <Clouds
        material={THREE.MeshLambertMaterial}
        limit={100}
        range={100}
        position={[0, 400, -500]}
      >
        <Cloud
          concentrate="outside"
          growth={500}
          color="#030813"
          opacity={1.15}
          seed={0.4}
          bounds={200}
          volume={100}
        />
        <Cloud
          concentrate="outside"
          growth={500}
          color="#760d30"
          opacity={1.15}
          seed={0.3}
          bounds={200}
          volume={300}
          position={[400, 0, 0]}
        />
        <Cloud
          concentrate="outside"
          growth={500}
          color="#4f1126"
          opacity={1.15}
          seed={0.3}
          bounds={200}
          volume={300}
          position={[-400, 0, 0]}
        />
      </Clouds>
    </group>
  );
}
