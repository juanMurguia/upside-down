import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import Scene from "./Scene";

// Custom Pan Controls Component
function MousePanControls({ limit = 2 }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const panRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to [-1, 1]
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      // Clamp pan offset
      panRef.current.x = THREE.MathUtils.clamp(x * limit, -limit, limit);
      panRef.current.y = THREE.MathUtils.clamp(-y * limit, -limit, limit);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [limit]);

  useEffect(() => {
    const animate = () => {
      if (controlsRef.current) {
        // Smoothly interpolate target
        controlsRef.current.target.x +=
          (panRef.current.x - controlsRef.current.target.x) * 0.05;
        controlsRef.current.target.y +=
          (panRef.current.y - controlsRef.current.target.y) * 0.05;
        controlsRef.current.update();
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      enablePan={false}
      enableRotate={false}
    />
  );
}

// App Component
export default function App() {
  return (
    <div className="app">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2, 35], fov: 55 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <MousePanControls limit={2} />
        <Scene />
      </Canvas>
    </div>
  );
}
