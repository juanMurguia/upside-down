import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type SpikeInstance = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: THREE.Color;
};

const BASE_COLOR = new THREE.Color("#380707");

export default function SpikeRocks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const spikes = useMemo<SpikeInstance[]>(() => {
    const instances: SpikeInstance[] = [];
    const count = 130;

    for (let i = 0; i < count; i += 1) {
      const height = THREE.MathUtils.lerp(10, 52, Math.random());
      const radius = THREE.MathUtils.lerp(2.5, 9, Math.random());
      const x = THREE.MathUtils.lerp(-200, 200, Math.random());
      const z = THREE.MathUtils.lerp(-240, -70, Math.random());
      const y = -20 + height / 2;
      const rotationY = Math.random() * Math.PI * 2;
      const tiltX = THREE.MathUtils.degToRad(
        THREE.MathUtils.lerp(-8, 8, Math.random())
      );
      const tiltZ = THREE.MathUtils.degToRad(
        THREE.MathUtils.lerp(-8, 8, Math.random())
      );

      instances.push({
        position: [x, y, z],
        rotation: [tiltX, rotationY, tiltZ],
        scale: [radius, height, radius],
        color: BASE_COLOR.clone().offsetHSL(
          0,
          0,
          THREE.MathUtils.lerp(-0.06, 0.06, Math.random())
        ),
      });
    }

    return instances;
  }, []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    const temp = new THREE.Object3D();
    spikes.forEach((spike, index) => {
      temp.position.set(...spike.position);
      temp.rotation.set(...spike.rotation);
      temp.scale.set(...spike.scale);
      temp.updateMatrix();
      mesh.setMatrixAt(index, temp.matrix);
      mesh.setColorAt(index, spike.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [spikes]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, spikes.length]}>
      <coneGeometry args={[1, 1, 6]} />
      <meshStandardMaterial
        roughness={0.95}
        metalness={0.05}
        color={BASE_COLOR}
        vertexColors
      />
    </instancedMesh>
  );
}
