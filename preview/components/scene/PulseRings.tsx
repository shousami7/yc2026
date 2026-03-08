"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

type Ring = {
  offset: number;
  speed: number;
  maxScale: number;
  color: string;
};

const RING_COUNT = 4;

export const PulseRings = () => {
  const [rings] = useState<Ring[]>(() =>
    new Array(RING_COUNT).fill(0).map(() => ({
      offset: Math.random(),
      speed: 0.2 + Math.random() * 0.25,
      maxScale: 12 + Math.random() * 12,
      color: Math.random() > 0.3 ? "#D4AF37" : "#00e0ff",
    }))
  );

  const ringRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    ringRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const ring = rings[i];
      const progress = ((t * ring.speed + ring.offset) % 1 + 1) % 1;

      const scale = 4 + ring.maxScale * progress;
      mesh.scale.setScalar(scale);

      const material = mesh.material as THREE.MeshBasicMaterial;
      if (material) {
        material.opacity = THREE.MathUtils.lerp(0.28, 0, progress);
      }
    });
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
      {rings.map((ring, i) => (
        <mesh
          key={`ring-${i}`}
          ref={(node) => (ringRefs.current[i] = node)}
        >
          <ringGeometry args={[3.6, 3.9, 64]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};
