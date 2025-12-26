"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useStore } from "@/store";

// Simple custom shader for the beam
const VertexShader = `
uniform float uTime;
uniform float uTurbulence;
varying vec2 vUv;
varying float vNoise;

// Simplex noise function (simplified)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vUv = uv;
  
  // Calculate noise based on position and time
  float noise = snoise(vec3(position.x * 2.0, position.z * 2.0, uTime * 2.0 - position.y * 0.5));
  vNoise = noise;
  
  // Displace vertex based on turbulence
  vec3 newPos = position;
  float displacement = noise * uTurbulence * 0.5; // Scale displacement
  
  // Only displace if not at the very start (source)
  // Assuming y goes from -5 to 5, we want source at top (y=5) to be stable
  // Let's say beam starts at y=5 and goes to y=-5
  // We want displacement to increase as we go down
  
  float dist = smoothstep(5.0, -5.0, position.y);
  newPos.x += displacement * dist;
  newPos.z += displacement * dist;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`;

const FragmentShader = `
uniform float uTime;
uniform float uTurbulence;
uniform vec3 uColor;
varying vec2 vUv;
varying float vNoise;

void main() {
  // Core beam intensity
  float intensity = 1.0 - abs(vUv.x - 0.5) * 2.0;
  intensity = pow(intensity, 3.0); // Sharpen the core
  
  // Pulse effect
  float pulse = 0.8 + 0.2 * sin(uTime * 5.0 - vUv.y * 10.0);
  
  // Add some "interference" pattern based on turbulence
  float interference = smoothstep(0.4, 0.6, vNoise * uTurbulence);
  
  vec3 finalColor = uColor * intensity * pulse;
  finalColor += vec3(1.0) * interference * 0.2; // White sparks
  
  // Fade out edges
  float alpha = intensity;
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

export default function LaserBeam() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { turbulence, aoActive } = useStore();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTurbulence: { value: 0 },
      uColor: { value: new THREE.Color("#ff0055") },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      // Target turbulence calculation
      // If AO is active, effectively reduce the visual turbulence in the beam *after* correction
      // But physically, the beam is distorted until it hits the mirror. 
      // For this viz, let's say the beam we see is the "path". 
      // Maybe we visualize the "uncorrected" beam until it hits the mirror.
      // Let's just map the raw turbulence for now to show "The Problem".
      // When AO is active, maybe we change color or stabilize it visually to show "The Solution"?
      // Actually, AO corrects the wavefront *phase*. 
      // Visual metaphor: 
      // AO OFF: Beam gets wobbly.
      // AO ON: Beam gets straight (as if the mirror pre-compensated or post-compensated).
      
      let targetTurbulence = turbulence;
      if (aoActive && turbulence < 0.6) { // AO works well in moderate turbulence
          targetTurbulence = turbulence * 0.1; // Reduced jitter
      } else if (aoActive && turbulence >= 0.6) { // Saturation
          targetTurbulence = turbulence * 0.8; // Still bad
      }

      // Smooth interpolation for the uniform
      materialRef.current.uniforms.uTurbulence.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uTurbulence.value,
        targetTurbulence,
        0.1
      );
      
      // Change color if AO is fixing it
      const targetColor = aoActive && turbulence < 0.6 ? new THREE.Color("#00ff9d") : new THREE.Color("#ff0055");
      materialRef.current.uniforms.uColor.value.lerp(targetColor, 0.1);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {/* A long cylinder representing the beam path */}
      <cylinderGeometry args={[0.1, 0.5, 15, 32, 64, true]} /> 
      <shaderMaterial
        ref={materialRef}
        vertexShader={VertexShader}
        fragmentShader={FragmentShader}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
      />
    </mesh>
  );
}
