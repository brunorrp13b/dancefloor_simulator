import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D } from '@react-three/drei';

function NeonSign() {
  const signRef = useRef();
  
  useFrame((state) => {
    if (signRef.current) {
      // Pulsing neon effect
      const intensity = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      signRef.current.material.emissiveIntensity = intensity;
    }
  });

  return (
    <group position={[0, 6, -9.8]}>
      {/* Background plate */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[6, 1.2, 0.1]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      
      <mesh ref={signRef}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.8}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.05}
          bevelSize={0.02}
          bevelSegments={5}
          center
        >
          CLUB SIMULATOR
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={1}
            toneMapped={false}
          />
        </Text3D>
      </mesh>
      
      {/* Add some glow lights */}
      <pointLight position={[0, 0, 1]} intensity={2} color="#ff00ff" distance={5} />
      <pointLight position={[0, 0, -1]} intensity={1} color="#ffffff" distance={3} />
    </group>
  );
}

function LaserBeams() {
  const beamsRef = useRef([]);
  
  useFrame((state) => {
    beamsRef.current.forEach((beam, i) => {
      if (beam) {
        const time = state.clock.elapsedTime;
        beam.rotation.y = Math.sin(time * 0.5 + i) * Math.PI * 0.25;
        beam.rotation.z = Math.cos(time * 0.5 + i) * Math.PI * 0.25;
      }
    });
  });

  return (
    <group position={[0, 8, 0]}>
      {Array.from({ length: 4 }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => (beamsRef.current[i] = el)}
          rotation={[0, (i * Math.PI) / 2, 0]}
        >
          <cylinderGeometry args={[0.02, 0.02, 20]} />
          <meshBasicMaterial
            color={`hsl(${i * 90}, 100%, 50%)`}
            opacity={0.6}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

export default function Decorations() {
  return (
    <>
      <NeonSign />
      <LaserBeams />
      
      {/* Decorative spheres */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * Math.PI * 0.2) * 8,
            6 + Math.cos(i * Math.PI * 0.2) * 2,
            Math.cos(i * Math.PI * 0.2) * 8
          ]}
        >
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial
            color={`hsl(${i * 36}, 70%, 50%)`}
            emissive={`hsl(${i * 36}, 70%, 50%)`}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </>
  );
} 