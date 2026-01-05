import { Cloud, Clouds } from "@react-three/drei";
import * as THREE from "three";

const FALLBACK_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAA" +
  "AAC0lEQVR42mP8/x8AAwMCAO+/8ZkAAAAASUVORK5CYII=";

function createCloudTexture() {
  if (typeof document === "undefined") {
    return FALLBACK_DATA_URL;
  }

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return FALLBACK_DATA_URL;
  }

  ctx.clearRect(0, 0, size, size);
  ctx.globalCompositeOperation = "source-over";

  for (let i = 0; i < 9; i++) {
    const x = size * (0.18 + Math.random() * 0.64);
    const y = size * (0.2 + Math.random() * 0.6);
    const radius = size * (0.2 + Math.random() * 0.24);
    const gradient = ctx.createRadialGradient(
      x,
      y,
      radius * 0.05,
      x,
      y,
      radius
    );
    gradient.addColorStop(0, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.5)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toDataURL("image/png");
}

export default function CloudLayer() {
  return (
    <Clouds
      material={THREE.MeshLambertMaterial}
      limit={400}
      range={90}
      position={[0, 20, -10]}
      frustumCulled={false}
    >
      <Cloud
        segments={26}
        bounds={[18, 6, 10]}
        scale={[4, 3, 3]}
        volume={13}
        opacity={1}
        speed={0.2}
        color="#3a5b82"
        position={[-18, 6, -8]}
      />
      <Cloud
        segments={30}
        bounds={[20, 7, 12]}
        scale={[1.4, 0.8, 1]}
        volume={15}
        opacity={0.75}
        speed={0.08}
        color="#2c4c6b"
        position={[12, 8, -12]}
      />
      <Cloud
        segments={22}
        bounds={[16, 5, 8]}
        scale={[1.1, 0.6, 1]}
        volume={12}
        opacity={0.65}
        speed={0.12}
        color="#1f3148"
        position={[2, 10, -24]}
      />
      <Cloud
        segments={18}
        bounds={[14, 5, 7]}
        scale={[0.9, 0.6, 1]}
        volume={10}
        opacity={0.6}
        speed={0.1}
        color="#b23a48"
        position={[22, 9, -30]}
      />
      <Cloud
        segments={20}
        bounds={[16, 6, 8]}
        scale={[1, 0.65, 1]}
        volume={12}
        opacity={0.65}
        speed={0.1}
        color="#c0434f"
        position={[-24, 7, -26]}
      />
    </Clouds>
  );
}
