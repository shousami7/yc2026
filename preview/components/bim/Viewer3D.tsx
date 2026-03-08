"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { LayoutJSON, Wall, Room } from "./types";

interface Viewer3DProps {
  layout: LayoutJSON;
}

export default function Viewer3D({ layout }: Viewer3DProps) {
  return (
    <div className="w-full h-full bg-[#0d0d0d]">
      <Canvas
        camera={{ position: [0, 12, 16], fov: 45, near: 0.1, far: 1000 }}
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        <Environment preset="city" />

        <Scene layout={layout} />

        <Grid
          args={[60, 60]}
          cellSize={1}
          cellThickness={0.4}
          cellColor="#1a1a1a"
          sectionSize={5}
          sectionThickness={0.8}
          sectionColor="#222222"
          fadeDistance={50}
          position={[0, 0, 0]}
        />

        <OrbitControls
          makeDefault
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.1}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}

function Scene({ layout }: { layout: LayoutJSON }) {
  const center = useMemo(() => computeCenter(layout), [layout]);

  return (
    <group position={[-center.x, 0, -center.y]}>
      {layout.walls.map((wall) => (
        <WallMesh key={wall.id} wall={wall} />
      ))}
      {layout.rooms.map((room) => (
        <FloorMesh key={room.id} room={room} />
      ))}
      {layout.doors.map((door) => (
        <DoorMarker key={door.id} position={[door.position.x, 0, door.position.y]} />
      ))}
      {layout.windows.map((win) => (
        <WindowMarker
          key={win.id}
          position={[win.position.x, win.sill_height + win.height / 2, win.position.y]}
        />
      ))}
    </group>
  );
}

function WallMesh({ wall }: { wall: Wall }) {
  const { position, rotation, length } = useMemo(() => {
    const dx = wall.end.x - wall.start.x;
    const dz = wall.end.y - wall.start.y;
    const len = Math.sqrt(dx * dx + dz * dz);
    const cx = (wall.start.x + wall.end.x) / 2;
    const cz = (wall.start.y + wall.end.y) / 2;
    const angle = Math.atan2(dz, dx);
    return {
      position: [cx, wall.height / 2, cz] as [number, number, number],
      rotation: [0, -angle, 0] as [number, number, number],
      length: len,
    };
  }, [wall]);

  if (length < 0.01) return null;

  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[length, wall.height, wall.thickness]} />
      <meshStandardMaterial color="#e8e4dc" roughness={0.8} metalness={0.0} />
    </mesh>
  );
}

function FloorMesh({ room }: { room: Room }) {
  const geometry = useMemo(() => {
    if (room.polygon.length < 3) return null;
    const shape = new THREE.Shape();
    shape.moveTo(room.polygon[0].x, room.polygon[0].y);
    for (let i = 1; i < room.polygon.length; i++) {
      shape.lineTo(room.polygon[i].x, room.polygon[i].y);
    }
    shape.closePath();
    const geo = new THREE.ShapeGeometry(shape);
    // Rotate flat shape to lie on XZ plane
    const matrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
    geo.applyMatrix4(matrix);
    return geo;
  }, [room]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} receiveShadow position={[0, 0.01, 0]}>
      <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
    </mesh>
  );
}

function DoorMarker({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], position[1] + 1.1, position[2]]}>
      <boxGeometry args={[0.9, 2.2, 0.05]} />
      <meshStandardMaterial color="#7c6a4a" roughness={0.6} transparent opacity={0.7} />
    </mesh>
  );
}

function WindowMarker({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1.2, 1.0, 0.05]} />
      <meshStandardMaterial color="#88c4e8" roughness={0.1} transparent opacity={0.4} />
    </mesh>
  );
}

function computeCenter(layout: LayoutJSON): { x: number; y: number } {
  const points = [
    ...layout.walls.flatMap((w) => [w.start, w.end]),
    ...layout.rooms.flatMap((r) => r.polygon),
  ];
  if (points.length === 0) return { x: 0, y: 0 };
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
}
