"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import OverlayUI from "./OverlayUI";
import { CameraRig } from "./scene/CameraRig";
import { CityScape } from "./scene/CityScape";
import { PulseRings } from "./scene/PulseRings";
import { SkyTraffic } from "./scene/SkyTraffic";

export default function Hero3D() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-luxury-black">
      <OverlayUI />

      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 8, 26], fov: 40 }}
          gl={{ antialias: false, toneMappingExposure: 1.4 }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} color="#1a1a2e" />
            <pointLight position={[12, 12, 12]} intensity={1.1} color="#D4AF37" />
            <fog attach="fog" args={["#050505", 5, 70]} />

            <CityScape />
            <PulseRings />
            <SkyTraffic />
            <CameraRig />

            <EffectComposer disableNormalPass>
              <Bloom
                luminanceThreshold={1}
                mipmapBlur
                intensity={1.6}
                radius={0.4}
              />
              <Noise opacity={0.05} />
              <Vignette eskil={false} offset={0.1} darkness={1.05} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-luxury-black/55 via-transparent to-luxury-black/85" />
    </main>
  );
}
