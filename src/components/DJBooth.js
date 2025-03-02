import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import useGameStore from '../store/gameStore';

function Turntable({ position, rotation }) {
  const discRef = useRef();
  
  useFrame((state) => {
    if (discRef.current) {
      discRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Turntable base */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Record */}
      <mesh ref={discRef} position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.02, 32]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}

function VUMeter({ position }) {
  const meterRef = useRef();
  
  useFrame((state) => {
    if (meterRef.current) {
      const time = state.clock.elapsedTime;
      meterRef.current.scale.y = 0.5 + Math.abs(Math.sin(time * 4)) * 0.5;
    }
  });

  return (
    <mesh ref={meterRef} position={position}>
      <boxGeometry args={[0.1, 1, 0.1]} />
      <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
    </mesh>
  );
}

export default function DJBooth() {
  return (
    <group position={[8, 1, -8]}>
      {/* Main booth structure */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[3, 2, 1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Equipment */}
      <Turntable position={[-0.8, 2.1, 0]} rotation={[0, 0, 0]} />
      <Turntable position={[0.8, 2.1, 0]} rotation={[0, 0, 0]} />
      
      {/* Mixer */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[1, 0.1, 0.5]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      
      {/* VU Meters */}
      {Array.from({ length: 8 }, (_, i) => (
        <VUMeter
          key={i}
          position={[-0.7 + i * 0.2, 2.3, 0]}
        />
      ))}
      
      {/* Decorative lights */}
      {Array.from({ length: 3 }, (_, i) => (
        <pointLight
          key={i}
          position={[-1 + i, 2.5, 0.5]}
          intensity={0.5}
          color={`hsl(${i * 120}, 100%, 50%)`}
        />
      ))}
    </group>
  );
} 