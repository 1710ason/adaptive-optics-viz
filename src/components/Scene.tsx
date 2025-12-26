"use client";

import { useFrame } from "@react-three/fiber";
import { useScroll, PerspectiveCamera, Stars } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { useStore } from "@/store";
import LaserBeam from "./LaserBeam";
import DeformableMirror from "./DeformableMirror";

export default function Scene() {
  const scroll = useScroll();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  const setTurbulence = useStore((state) => state.setTurbulence);
  const setAoActive = useStore((state) => state.setAoActive);
  const setScrollProgress = useStore((state) => state.setScrollProgress);
  const setCurrentSection = useStore((state) => state.setCurrentSection);

  useFrame((state) => {
    const r1 = scroll.range(0, 1/4);
    const r2 = scroll.range(1/4, 1/4);
    const r3 = scroll.range(2/4, 1/4);
    const r4 = scroll.range(3/4, 1/4);
    
    // Update global scroll progress
    setScrollProgress(scroll.offset);

    // Section Logic
    if (scroll.offset < 0.25) setCurrentSection(0);
    else if (scroll.offset < 0.5) setCurrentSection(1);
    else if (scroll.offset < 0.75) setCurrentSection(2);
    else setCurrentSection(3);

    // Turbulence Control (Section 2 & 4 drive it)
    // Section 1 (0.25 - 0.5): Increase turbulence
    if (scroll.visible(1/4, 1/4)) {
        // Map 0-1 range of this section to 0-1 turbulence
        // Actually, let's make turbulence strictly follow scroll in that section
        const val = scroll.curve(1/4, 1/4); 
        setTurbulence(val);
    } 
    // Section 3 (0.75 - 1.0): "The Limit" - High turbulence
    else if (scroll.visible(3/4, 1/4)) {
         setTurbulence(0.8 + scroll.curve(3/4, 1/4) * 0.2); // 0.8 to 1.0
    }
    
    // AO Active Logic (Section 2 onwards)
    // Actually, let's say AO turns on in Section 2 (0.5 - 0.75)
    if (scroll.offset > 0.5 && scroll.offset < 0.9) {
        setAoActive(true);
    } else {
        setAoActive(false);
    }
    
    // Camera Animation
    if (cameraRef.current) {
        const t = state.clock.getElapsedTime();
        
        // Base positions
        const p0 = new THREE.Vector3(0, 2, 12);
        const t0 = new THREE.Vector3(0, 0, 0);
        
        const p1 = new THREE.Vector3(5, 0, 5); // Side view
        const t1 = new THREE.Vector3(0, 0, 0);
        
        const p2 = new THREE.Vector3(0, 3, 6); // Look at mirror/bottom
        const t2 = new THREE.Vector3(0, -5, 0);
        
        const p3 = new THREE.Vector3(0, 0, 14); // Back to wide
        const t3 = new THREE.Vector3(0, 0, 0);

        let targetPos = new THREE.Vector3();
        let targetLook = new THREE.Vector3();

        if (scroll.offset < 0.25) {
            // Intro
            targetPos.lerpVectors(p0, p1, scroll.offset * 4);
            targetLook.lerpVectors(t0, t1, scroll.offset * 4);
        } else if (scroll.offset < 0.5) {
            // Turbulence View
            const local = (scroll.offset - 0.25) * 4;
            targetPos.lerpVectors(p1, p2, local);
            targetLook.lerpVectors(t1, t2, local);
        } else if (scroll.offset < 0.75) {
             // AO View
            const local = (scroll.offset - 0.5) * 4;
            targetPos.lerpVectors(p2, p3, local);
            targetLook.lerpVectors(t2, t3, local);
        } else {
            // Outro
             targetPos.copy(p3);
             targetLook.copy(t3);
             
             // Gentle sway
             targetPos.x += Math.sin(t * 0.5);
        }

        cameraRef.current.position.lerp(targetPos, 0.1);
        cameraRef.current.lookAt(targetLook);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} fov={50} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} color="#001133" />
      <pointLight position={[10, 10, 10]} intensity={2} color="#44aaff" />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#ff0055" />
      
      {/* Environment */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Objects */}
      <LaserBeam />
      <DeformableMirror />
      
      {/* Visual guide for turbulence field */}
      <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 10, 4]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.05} />
      </mesh>
    </>
  );
}
