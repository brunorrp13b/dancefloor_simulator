import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from '../store/gameStore';

export default function Character({ position, isPlayer = false, characterType = 'player' }) {
  const characterRef = useRef();
  const walkCycle = useRef(0);
  const danceCycle = useRef(0);
  const {
    isDancing,
    currentDanceMove,
    playerPosition,
    playerRotation,
    setPlayerPosition,
    isSitting
  } = useGameStore();

  // Animation parameters
  const walkingSpeed = 0.15;
  const bobHeight = 0.1;
  const danceHeight = 0.2;
  const legSwingAngle = Math.PI / 6;

  useFrame((state, delta) => {
    if (!characterRef.current || isSitting) return;

    const char = characterRef.current;
    const isMoving = isPlayer ? 
      (playerPosition[0] !== position[0] || playerPosition[2] !== position[2]) :
      false;

    // Update position for player
    if (isPlayer) {
      char.position.x = playerPosition[0];
      char.position.z = playerPosition[2];
      char.rotation.y = playerRotation[1];
    }

    // Walking animation
    if (isMoving && !isDancing) {
      walkCycle.current += delta * 10;
      // Bob up and down while walking
      char.position.y = bobHeight * Math.abs(Math.sin(walkCycle.current)) + 1;
      
      // Animate legs
      const leftLeg = char.getObjectByName('leftLeg');
      const rightLeg = char.getObjectByName('rightLeg');
      if (leftLeg && rightLeg) {
        leftLeg.rotation.x = Math.sin(walkCycle.current) * legSwingAngle;
        rightLeg.rotation.x = Math.sin(walkCycle.current + Math.PI) * legSwingAngle;
      }
    }

    // Dancing animation
    if (isDancing) {
      danceCycle.current += delta * 5;
      
      switch (currentDanceMove) {
        case 'basic':
          char.position.y = danceHeight * Math.abs(Math.sin(danceCycle.current)) + 1;
          char.rotation.y += Math.sin(danceCycle.current * 0.5) * 0.1;
          break;
        case 'spin':
          char.rotation.y += delta * 5;
          char.position.y = danceHeight * Math.abs(Math.sin(danceCycle.current)) + 1;
          break;
        case 'wave':
          char.position.y = danceHeight * Math.abs(Math.sin(danceCycle.current)) + 1;
          // Wave arms
          const leftArm = char.getObjectByName('leftArm');
          const rightArm = char.getObjectByName('rightArm');
          if (leftArm && rightArm) {
            leftArm.rotation.z = Math.sin(danceCycle.current) * Math.PI / 4;
            rightArm.rotation.z = Math.sin(danceCycle.current + Math.PI) * Math.PI / 4;
          }
          break;
        case 'jump':
          char.position.y = danceHeight * 2 * Math.abs(Math.sin(danceCycle.current)) + 1;
          break;
      }
    }

    // Reset to standing position when not moving or dancing
    if (!isMoving && !isDancing) {
      char.position.y = 1;
      const leftLeg = char.getObjectByName('leftLeg');
      const rightLeg = char.getObjectByName('rightLeg');
      const leftArm = char.getObjectByName('leftArm');
      const rightArm = char.getObjectByName('rightArm');
      
      if (leftLeg) leftLeg.rotation.x = 0;
      if (rightLeg) rightLeg.rotation.x = 0;
      if (leftArm) leftArm.rotation.z = 0;
      if (rightArm) rightArm.rotation.z = 0;
    }
  });

  return (
    <group ref={characterRef} position={position}>
      {/* Body */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.4, 0.8, 0.2]} />
        <meshStandardMaterial 
          color={characterType === 'player' ? '#000000' : 
                characterType === 'pink_long' ? '#ff69b4' : '#4169e1'} 
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial 
          color={characterType === 'player' ? '#000000' : 
                characterType === 'pink_long' ? '#ff69b4' : '#4169e1'} 
        />
      </mesh>

      {/* Hat */}
      {characterType === 'player' && (
        <group position={[0, 1.9, 0]}>
          {/* Hat brim */}
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.02, 32]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Hat top */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      )}

      {/* Gold Chain */}
      {characterType === 'player' && (
        <mesh position={[0, 1.5, 0.11]}>
          <torusGeometry args={[0.12, 0.02, 16, 32]} />
          <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.3} />
        </mesh>
      )}

      {/* Arms */}
      <group name="leftArm" position={[-0.3, 1.4, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial 
            color={characterType === 'player' ? '#000000' : 
                  characterType === 'pink_long' ? '#ff69b4' : '#4169e1'} 
          />
        </mesh>
      </group>
      <group name="rightArm" position={[0.3, 1.4, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial 
            color={characterType === 'player' ? '#000000' : 
                  characterType === 'pink_long' ? '#ff69b4' : '#4169e1'} 
          />
        </mesh>
      </group>

      {/* Legs */}
      <group name="leftLeg" position={[-0.1, 0.8, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          <meshStandardMaterial 
            color={characterType === 'player' ? '#000000' : 
                  characterType === 'pink_long' ? '#ff69b4' : '#4169e1'} 
          />
        </mesh>
      </group>
      <group name="rightLeg" position={[0.1, 0.8, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          <meshStandardMaterial 
            color={characterType === 'player' ? '#000000' : 
                  characterType === 'pink_long' ? '#ff69b4' : '#4169e1'} 
          />
        </mesh>
      </group>
    </group>
  );
} 