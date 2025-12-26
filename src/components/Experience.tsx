"use client";

import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll } from "@react-three/drei";
import Scene from "./Scene";
import Overlay from "./Overlay";
import Dashboard from "./Dashboard";
import { Suspense } from "react";

export default function Experience() {
  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
        <Dashboard />
      </div>
      <Canvas
        shadows
        camera={{ position: [0, 2, 10], fov: 45 }}
        className="w-full h-full bg-black"
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
            <ScrollControls pages={6} damping={0.2}>
                <Scene />
                <Scroll html>
                    <Overlay />
                </Scroll>
            </ScrollControls>
        </Suspense>
      </Canvas>
    </>
  );
}
