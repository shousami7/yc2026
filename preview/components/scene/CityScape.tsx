"use client";

import { Instance, Instances } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

const BUILDING_COUNT = 80;
const PARTICLE_COUNT = 240;
const BEACON_COUNT = 10;

type Building = {
  position: [number, number, number];
  height: number;
  width: number;
  lights: {
    position: [number, number, number];
    scale: [number, number, number];
    color: string;
  }[];
};

export const CityScape = () => {
  const [buildings] = useState<Building[]>(() =>
    new Array(BUILDING_COUNT).fill(0).map(() => {
      const height = Math.random() * 22 + 10;
      const width = Math.random() * 4 + 2;
      const position: Building["position"] = [
        (Math.random() - 0.5) * 160,
        0,
        (Math.random() - 0.5) * 120 - 30,
      ];

      const windowCount = Math.random() > 0.25 ? Math.floor(Math.random() * 3) + 1 : 0;
      const lights = new Array(windowCount).fill(0).map(() => {
        const color = Math.random() > 0.8 ? "#ffaa00" : "#00ddff";
        return {
          position: [
            position[0],
            Math.random() * height,
            position[2] + width / 2 + 0.12,
          ] as [number, number, number],
          scale: [
            Math.random() * 1.2 + 0.3,
            Math.random() * 1.4 + 0.6,
            0.08,
          ] as [number, number, number],
          color,
        };
      });

      return { position, height, width, lights };
    })
  );

  const [particlePositions] = useState<Float32Array>(() =>
    Float32Array.from(
      { length: PARTICLE_COUNT * 3 },
      () => (Math.random() - 0.5) * 120
    )
  );

  const particlesRef = useRef<THREE.Points>(null);
  const beaconRefs = useRef<Array<THREE.Mesh | null>>([]);
  const sweepRef = useRef<THREE.Mesh>(null);

  const [beacons] = useState(() => {
    const indices = new Set<number>();
    while (indices.size < BEACON_COUNT) {
      indices.add(Math.floor(Math.random() * buildings.length));
    }

    return Array.from(indices).map((idx) => {
      const b = buildings[idx];
      return {
        position: [b.position[0], b.height + 1.5, b.position[2]] as [
          number,
          number,
          number
        ],
        color: Math.random() > 0.5 ? "#00e0ff" : "#D4AF37",
      };
    });
  });

  // Very slow rotation to give the particles a subtle drift around the skyline.
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }

    const time = state.clock.getElapsedTime();

    beaconRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const pulse = (Math.sin(time * 2.2 + i * 0.8) + 1) / 2;
      const emissive = pulse * 1.6 + 0.4;
      mesh.scale.setScalar(0.9 + pulse * 0.45);
      mesh.position.y = beacons[i].position[1] + Math.sin(time * 1.3 + i) * 0.5;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = emissive;
        mat.opacity = 0.55 + pulse * 0.3;
      }
    });

    if (sweepRef.current) {
      const sweepZ = ((time * 8) % 240) - 120;
      sweepRef.current.position.z = sweepZ;
      const mat = sweepRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.18 + Math.sin(time * 2) * 0.05;
      }
    }
  });

  return (
    <group position={[0, -15, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[320, 320]} />
        <meshStandardMaterial
          color="#020202"
          roughness={0.12}
          metalness={0.9}
        />
      </mesh>

      <Instances range={BUILDING_COUNT}>
        <boxGeometry />
        <meshStandardMaterial color="#0e0e0e" roughness={0.25} metalness={0.9} />
        {buildings.map((data, i) => (
          <Instance
            key={i}
            position={[data.position[0], data.height / 2, data.position[2]]}
            scale={[data.width, data.height, data.width]}
          />
        ))}
      </Instances>

        {buildings.map((data, i) =>
        data.lights.map((light, idx) => (
          <mesh key={`light-${i}-${idx}`} position={light.position} scale={light.scale}>
            <planeGeometry />
            <meshBasicMaterial color={light.color} toneMapped={false} />
          </mesh>
        ))
      )}

      <group>
        {beacons.map((beacon, i) => (
          <mesh
            key={`beacon-${i}`}
            ref={(node) => (beaconRefs.current[i] = node)}
            position={beacon.position}
            renderOrder={2}
            transparent
          >
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial
              color={beacon.color}
              emissive={beacon.color}
              emissiveIntensity={2}
              transparent
              opacity={0.6}
              roughness={0.1}
              metalness={1}
            />
            <pointLight
              color={beacon.color}
              intensity={2.2}
              distance={28}
              decay={2}
            />
          </mesh>
        ))}
      </group>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.22} color="#D4AF37" opacity={0.45} transparent />
      </points>

      <mesh
        ref={sweepRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.08, -120]}
      >
        <planeGeometry args={[220, 16]} />
        <meshBasicMaterial
          color="#1a8cff"
          transparent
          opacity={0.14}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
