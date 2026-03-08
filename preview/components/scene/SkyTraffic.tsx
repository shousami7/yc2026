"use client";

import { Trail } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

type Vehicle = {
  radius: number;
  height: number;
  speed: number;
  offset: number;
  lean: number;
  color: string;
};

const VEHICLE_COUNT = 10;

export const SkyTraffic = () => {
  const [vehicles] = useState<Vehicle[]>(() => {
    const palette = ["#D4AF37", "#00e0ff", "#8a7022"];

    return new Array(VEHICLE_COUNT).fill(0).map((_, i) => ({
      radius: 24 + Math.random() * 26 + i * 0.35,
      height: 10 + Math.random() * 12,
      speed: 0.22 + Math.random() * 0.45,
      offset: Math.random() * Math.PI * 2,
      lean: Math.random() * 0.18 + 0.04,
      color: palette[Math.floor(Math.random() * palette.length)],
    }));
  });

  const vehicleRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    vehicleRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const v = vehicles[i];

      const angle = t * v.speed + v.offset;
      const x = Math.cos(angle) * v.radius;
      const z = Math.sin(angle * 0.9) * v.radius * 0.9;
      const y = v.height + Math.sin(angle * 2.2) * 1.8;

      mesh.position.set(x, y, z);
      mesh.rotation.y = -angle + Math.PI / 2;
      mesh.rotation.z = Math.sin(angle * 1.6) * v.lean;
    });
  });

  return (
    <group>
      {vehicles.map((v, i) => (
        <Trail
          key={`vehicle-${i}`}
          width={1.2}
          length={10}
          decay={1.5}
          color={v.color}
          attenuation={(t) => 1 - t}
        >
          <mesh
            ref={(node) => (vehicleRefs.current[i] = node)}
            castShadow
            scale={[0.6, 0.6, 1.8]}
          >
            <capsuleGeometry args={[0.24, 0.7, 6, 12]} />
            <meshStandardMaterial
              color={v.color}
              emissive={v.color}
              emissiveIntensity={2.3}
              roughness={0.35}
              metalness={0.92}
            />
          </mesh>
        </Trail>
      ))}
    </group>
  );
};
