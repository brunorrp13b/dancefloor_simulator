import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import useGameStore from '../store/gameStore';

function DrinkMenu({ onBuyEnergyDrink, onBuyAlcoholicDrink, danceScore }) {
  return (
    <Html position={[0, 2.5, 0]} center>
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        color: 'white',
        width: '200px',
        textAlign: 'center',
        border: '1px solid #ff61df'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#ff61df' }}>Bar</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <p style={{ margin: '0 0 5px 0' }}>Need a boost? (20 dance points)</p>
            <button
              onClick={onBuyEnergyDrink}
              style={{
                background: '#ff61df',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '5px',
                color: 'white',
                cursor: danceScore >= 20 ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                opacity: danceScore >= 20 ? 1 : 0.5
              }}
              disabled={danceScore < 20}
            >
              Buy Energy Drink 🔋
            </button>
          </div>
          <div>
            <p style={{ margin: '10px 0 5px 0' }}>Feel more confident? (40 dance points)</p>
            <button
              onClick={onBuyAlcoholicDrink}
              style={{
                background: '#32CD32',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '5px',
                color: 'white',
                cursor: danceScore >= 40 ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                opacity: danceScore >= 40 ? 1 : 0.5
              }}
              disabled={danceScore < 40}
            >
              Buy Alcoholic Drink 🍸
            </button>
          </div>
        </div>
      </div>
    </Html>
  );
}

function NeonSign() {
  return (
    <group position={[0, 2.5, 0]}>
      {/* Background plate */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[2.2, 0.6, 0.1]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      
      {/* Neon text */}
      <Text
        position={[0, 0, 0.05]}
        fontSize={0.4}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
        characters="BAR"
        material-toneMapped={false}
      >
        BAR
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </Text>
      
      {/* Glow effects */}
      <pointLight
        position={[0, 0, 0.2]}
        distance={1}
        intensity={2}
        color="#00ff00"
      />
      <pointLight
        position={[0, 0, 0.1]}
        distance={0.5}
        intensity={1}
        color="#ffffff"
      />
    </group>
  );
}

export default function Barman() {
  const barmanRef = useRef();
  const [showMenu, setShowMenu] = useState(false);
  const [message, setMessage] = useState('');
  
  const {
    playerPosition,
    danceScore,
    energy,
    increaseEnergy,
    setDanceScore,
    buyAlcohol,
    isAtBar,
    setIsAtBar,
    isUnderAlcoholEffect,
    updateAlcoholEffect
  } = useGameStore();

  useFrame(() => {
    if (barmanRef.current) {
      // Check if player is near the bar
      const distanceToPlayer = Math.sqrt(
        Math.pow(playerPosition[0] - 5, 2) + // Bar is at x=5
        Math.pow(playerPosition[2] - 5, 2)   // Bar is at z=5
      );
      
      const isNearBar = distanceToPlayer < 2;
      setShowMenu(isNearBar);
      setIsAtBar(isNearBar);

      // Update alcohol effects if active
      if (isUnderAlcoholEffect) {
        updateAlcoholEffect();
      }
    }
  });

  const handleBuyEnergyDrink = () => {
    if (danceScore >= 20) {
      increaseEnergy();
      setDanceScore(danceScore - 20);
      setMessage('Enjoy your drink! Energy restored! 🔋✨');
    } else {
      setMessage('Not enough dance points! Keep dancing! 💃');
    }
    
    setTimeout(() => setMessage(''), 2000);
  };

  const handleBuyAlcoholicDrink = () => {
    const success = buyAlcohol();
    if (success) {
      setMessage('Feeling more confident! 🍸✨');
    } else {
      setMessage('Not enough dance points! Keep dancing! 💃');
    }
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <group ref={barmanRef} position={[5, 0, 5]}>
      {/* Neon Sign */}
      <NeonSign />
      
      {/* Bar Counter */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2, 0.8, 0.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Add some bottles on the bar */}
      <group position={[-0.7, 1.4, 0]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.3]} />
          <meshStandardMaterial color="#4a90e2" transparent opacity={0.6} />
        </mesh>
      </group>
      <group position={[-0.5, 1.4, 0]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.25]} />
          <meshStandardMaterial color="#e24a84" transparent opacity={0.6} />
        </mesh>
      </group>
      <group position={[-0.3, 1.4, 0]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.35]} />
          <meshStandardMaterial color="#4ae24a" transparent opacity={0.6} />
        </mesh>
      </group>
      
      {/* Barman body */}
      <group position={[0, 1.5, 0]}>
        {/* Head */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        
        {/* Body */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        
        {/* Arms */}
        <group position={[0, 0.8, 0]}>
          <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
          <mesh position={[0.2, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        </group>
      </group>
      
      {showMenu && (
        <DrinkMenu 
          onBuyEnergyDrink={handleBuyEnergyDrink}
          onBuyAlcoholicDrink={handleBuyAlcoholicDrink}
          danceScore={danceScore}
        />
      )}
      
      {message && (
        <Html position={[0, 3, 0]} center>
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '10px',
            borderRadius: '5px',
            color: 'white'
          }}>
            {message}
          </div>
        </Html>
      )}
    </group>
  );
} 