"use client";

import { useFrame } from "@react-three/fiber";
import { easing } from "maath";

export const CameraRig = () => {
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    const swayX = Math.sin(time * 0.25) * 3.2;
    const targetX = state.pointer.x * 2.2 + swayX;
    const targetY = state.pointer.y * 1.4 + 3.2;
    const targetZ = 24 + Math.cos(time * 0.18) * 2.8;

    easing.damp3(state.camera.position, [targetX, targetY, targetZ], 0.5, delta);

    const lookAtY = 5 + Math.sin(time * 0.6) * 0.6;
    state.camera.lookAt(Math.sin(time * 0.15) * 4, lookAtY, 0);

    const roll = state.pointer.x * 0.18 + Math.sin(time * 0.4) * 0.05;
    state.camera.rotation.z = easing.damp(state.camera.rotation.z, roll, 0.45, delta);
  });

  return null;
};
