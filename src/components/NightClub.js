import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { SpotLight, Html } from '@react-three/drei';
import useGameStore from '../store/gameStore';
import Character from './Character';

function DanceFloor() {
  const floorTilesRef = useRef([]);
  
  useFrame((state) => {
    floorTilesRef.current.forEach((tile, i) => {
      if (tile) {
        const time = state.clock.elapsedTime;
        const hue = (Math.sin(time * 0.5 + i) + 1) / 2;
        tile.material.color.setHSL(hue, 0.8, 0.5);
        tile.material.emissive.setHSL(hue, 0.8, 0.2);
      }
    });
  });

  return (
    <group position={[0, 0.01, 0]}>
      {Array.from({ length: 8 }, (_, i) =>
        Array.from({ length: 8 }, (_, j) => (
          <mesh
            key={`${i}-${j}`}
            position={[
              (i - 3.5) * 1.5,
              0,
              (j - 3.5) * 1.5
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
            ref={(el) => (floorTilesRef.current[i * 8 + j] = el)}
          >
            <planeGeometry args={[1.4, 1.4]} />
            <meshStandardMaterial
              toneMapped={false}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))
      )}
    </group>
  );
}

function DiscoLights() {
  const lightRefs = useRef([]);
  
  useFrame((state) => {
    lightRefs.current.forEach((light, i) => {
      if (light) {
        const time = state.clock.elapsedTime;
        light.position.x = Math.sin(time * 0.5 + i * Math.PI / 2) * 5;
        light.position.z = Math.cos(time * 0.5 + i * Math.PI / 2) * 5;
      }
    });
  });

  return (
    <>
      {Array.from({ length: 4 }, (_, i) => (
        <SpotLight
          key={i}
          ref={(el) => (lightRefs.current[i] = el)}
          position={[0, 8, 0]}
          angle={0.3}
          penumbra={0.8}
          intensity={2}
          color={`hsl(${i * 90}, 100%, 50%)`}
          castShadow
        />
      ))}
    </>
  );
}

function Door({ position, rotation }) {
  const {
    playerPosition,
    isDoorOpen,
    setDoorOpen,
    setPlayerPosition
  } = useGameStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const doorRef = useRef();
  
  useFrame(() => {
    if (doorRef.current) {
      // Calculate world position of the door considering bathroom position
      const worldPosition = [-5.5, 1, 5]; // Door's effective world position
      
      // Calculate distance using circular radius
      const dx = playerPosition[0] - worldPosition[0];
      const dz = playerPosition[2] - worldPosition[2];
      const distanceToDoor = Math.sqrt(dx * dx + dz * dz);
      
      // Show prompt when within interaction distance (2 units) regardless of angle
      setShowPrompt(distanceToDoor < 2 && isDoorOpen);
      
      // Animate door rotation
      const targetRotation = isDoorOpen ? Math.PI / 2 : 0;
      doorRef.current.rotation.y += (targetRotation - doorRef.current.rotation.y) * 0.1;

      // Block player movement through closed door
      if (!isDoorOpen) {
        const doorThickness = 0.6;
        const doorWidth = 1.2;
        const doorX = worldPosition[0];
        const doorZ = worldPosition[2];
        
        if (Math.abs(playerPosition[0] - doorX) < doorWidth / 2 &&
            Math.abs(playerPosition[2] - doorZ) < doorThickness) {
          const pushDirection = playerPosition[2] > doorZ ? 1 : -1;
          setPlayerPosition([
            playerPosition[0],
            playerPosition[1],
            doorZ + (pushDirection * doorThickness)
          ]);
        }
      }
    }
  });

  const toggleDoor = () => {
    setDoorOpen(!isDoorOpen);
  };

  return (
    <group position={position} rotation={rotation}>
      <group ref={doorRef}>
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[1.2, 2.5, 0.1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Door handle - outside */}
        <mesh position={[0.4, 1.25, 0.05]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Door handle - inside */}
        <mesh position={[0.4, 1.25, -0.05]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {showPrompt && (
        <Html
          position={[0, 1.5, 0.5]}
          center
          transform
          sprite
          occlude
        >
          <div className="message-box" style={{
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '20px',
            borderRadius: '10px',
            border: '2px solid #ff61df',
            color: 'white',
            width: '250px',
            boxShadow: '0 0 10px rgba(255, 97, 223, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              marginBottom: '15px',
              fontSize: '16px',
              color: '#ff61df'
            }}>
              {isDoorOpen ? 'Close the bathroom door?' : 'Open the bathroom door?'}
            </div>
            <button
              onClick={toggleDoor}
              style={{
                background: 'linear-gradient(45deg, #ff61df, #ff00ff)',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '20px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 0 10px rgba(255, 97, 223, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              {'Open Door 🚪'}
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}

function Mirror({ position, rotation }) {
  const {
    playerPosition,
    confidence,
    increaseConfidence,
    showConfidenceMessage,
    hideConfidenceMessage
  } = useGameStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const mirrorRef = useRef();

  useFrame(() => {
    if (mirrorRef.current) {
      // Calculate world position of the mirror (considering bathroom position)
      const worldPosition = [-8, 1, 3.1]; // Mirror's effective world position
      
      // Calculate distance using the same method as other interactions
      const dx = playerPosition[0] - worldPosition[0];
      const dz = playerPosition[2] - worldPosition[2];
      const distanceToMirror = Math.sqrt(dx * dx + dz * dz);
      
      // Show prompt when within interaction distance (2 units)
      setShowPrompt(distanceToMirror < 2);
    }
  });

  const handleConfidenceBoost = () => {
    increaseConfidence();
    setTimeout(hideConfidenceMessage, 2000);
  };

  return (
    <group position={position} rotation={rotation} ref={mirrorRef}>
      {/* Mirror frame */}
      <mesh position={[0, 2.5, 0.05]}>
        <boxGeometry args={[3, 5, 0.1]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Mirror surface */}
      <mesh position={[0, 2.5, 0]}>
        <planeGeometry args={[2.8, 4.8]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={1}
          roughness={0}
          reflectivity={1}
          clearcoat={1}
          clearcoatRoughness={0}
          envMapIntensity={2}
        />
      </mesh>

      {/* Mirror lighting for better reflection */}
      <pointLight position={[0, 2.5, 1]} intensity={0.5} color="#ffffff" />
      <pointLight position={[0, 2.5, -1]} intensity={0.3} color="#ffffff" />

      {showPrompt && (
        <Html
          position={[0, 1.5, 0.5]}
          center
          transform
          sprite
          occlude
        >
          <div className="message-box" style={{
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '20px',
            borderRadius: '10px',
            border: '2px solid #ff61df',
            color: 'white',
            width: '250px',
            boxShadow: '0 0 10px rgba(255, 97, 223, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              marginBottom: '15px',
              fontSize: '16px',
              color: '#ff61df'
            }}>
              Look in the mirror and work on your confidence
            </div>
            <button
              onClick={handleConfidenceBoost}
              style={{
                background: 'linear-gradient(45deg, #ff61df, #ff00ff)',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '20px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 0 10px rgba(255, 97, 223, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Build Confidence
            </button>
          </div>
        </Html>
      )}

      {showConfidenceMessage && (
        <Html position={[0, 4, 0.5]} center>
          <div style={{
            background: 'rgba(255, 0, 255, 0.8)',
            padding: '10px',
            borderRadius: '5px',
            color: 'white'
          }}>
            You can do it! 💪
          </div>
        </Html>
      )}
    </group>
  );
}

function Sink({ position }) {
  const {
    playerPosition,
    washFace,
    isWashingFace
  } = useGameStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [message, setMessage] = useState('');
  const sinkRef = useRef();

  useFrame(() => {
    if (sinkRef.current) {
      const worldPosition = [-8, 1, 3.1]; // Sink's effective world position
      const dx = playerPosition[0] - worldPosition[0];
      const dz = playerPosition[2] - worldPosition[2];
      const distanceToSink = Math.sqrt(dx * dx + dz * dz);
      setShowPrompt(distanceToSink < 2);
    }
  });

  const handleWashFace = () => {
    if (washFace()) {
      setMessage('Feeling refreshed! ✨');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  return (
    <group ref={sinkRef} position={position}>
      {/* Sink base */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Sink bowl */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.3, 0.2, 0.2, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Faucet */}
      <mesh position={[0, 0.6, -0.2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Faucet spout */}
      <mesh position={[0, 0.6, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>

      {showPrompt && (
        <Html position={[0, 1, 0.5]} center>
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '15px',
            borderRadius: '10px',
            border: '2px solid #ff61df',
            color: 'white',
            width: '200px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '10px', color: '#ff61df' }}>
              Wash your face
            </div>
            <button
              onClick={handleWashFace}
              disabled={isWashingFace}
              style={{
                background: 'linear-gradient(45deg, #ff61df, #ff00ff)',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '20px',
                color: 'white',
                cursor: isWashingFace ? 'not-allowed' : 'pointer',
                opacity: isWashingFace ? 0.5 : 1
              }}
            >
              Wash Face 💧
            </button>
          </div>
        </Html>
      )}

      {message && (
        <Html position={[0, 1.5, 0]} center>
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '10px',
            borderRadius: '5px',
            color: '#ff61df'
          }}>
            {message}
          </div>
        </Html>
      )}
    </group>
  );
}

function Toilet({ position }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Bowl */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.2, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Tank */}
      <mesh position={[0, 0.6, -0.25]}>
        <boxGeometry args={[0.5, 0.8, 0.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Seat */}
      <mesh position={[0, 0.5, 0]} rotation={[0.1, 0, 0]}>
        <torusGeometry args={[0.2, 0.05, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Bathroom({ position }) {
  return (
    <group position={position}>
      {/* Bathroom walls */}
      <mesh position={[0, 2.5, -2]} rotation={[0, 0, 0]}>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
      <mesh position={[-3, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4, 5]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
      <mesh position={[3, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[4, 5]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
      
      {/* Floor tiles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Door */}
      <Door position={[2.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      
      {/* Mirror on wall */}
      <Mirror position={[0, 0, -1.9]} rotation={[0, 0, 0]} />
      
      {/* Sink under mirror */}
      <Sink position={[0, 0, -1.5]} />
      
      {/* Toilet */}
      <Toilet position={[2, 0, -1.5]} />
      
      {/* Bathroom lighting */}
      <pointLight position={[0, 4, 0]} intensity={0.8} color="#ffffff" />
      
      {/* Bathroom sign */}
      <group position={[3, 3.5, -0.1]} rotation={[0, Math.PI * 90 / 180, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.4, 0.05]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[0.7, 0.3, 0.01]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <pointLight position={[0, 0, 0.2]} intensity={0.3} color="#ffffff" />
      </group>
    </group>
  );
}

function Couch({ position, rotation }) {
  const {
    playerPosition,
    energy,
    increaseEnergy,
    isSitting,
    setSitting
  } = useGameStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [message, setMessage] = useState('');
  const couchRef = useRef();

  useFrame(() => {
    if (couchRef.current) {
      // Calculate world position of the couch
      const worldPosition = [8, 1, -5]; // Couch's effective world position
      
      // Calculate distance using the same method as other interactions
      const dx = playerPosition[0] - worldPosition[0];
      const dz = playerPosition[2] - worldPosition[2];
      const distanceToCouch = Math.sqrt(dx * dx + dz * dz);
      
      // Show prompt when within interaction distance (2 units)
      setShowPrompt(distanceToCouch < 2);
    }
  });

  const handleRest = () => {
    if (!isSitting) {
      setSitting(true);
      increaseEnergy();
      setMessage('Energy restored! 🔋');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const handleStandUp = () => {
    setSitting(false);
  };

  return (
    <group position={position} rotation={rotation} ref={couchRef}>
      {/* Couch base */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2, 0.4, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Couch back */}
      <mesh position={[0, 1, -0.4]}>
        <boxGeometry args={[2, 0.8, 0.2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Couch arms */}
      <mesh position={[-1, 0.6, 0]}>
        <boxGeometry args={[0.2, 0.8, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[1, 0.6, 0]}>
        <boxGeometry args={[0.2, 0.8, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Cushions */}
      <mesh position={[-0.5, 0.5, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
      <mesh position={[0.5, 0.5, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>

      {showPrompt && (
        <Html
          position={[0, 1.5, 0.5]}
          center
          transform
          sprite
          occlude
        >
          <div className="message-box" style={{
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '20px',
            borderRadius: '10px',
            border: '2px solid #ff61df',
            color: 'white',
            width: '250px',
            boxShadow: '0 0 10px rgba(255, 97, 223, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              marginBottom: '15px',
              fontSize: '16px',
              color: '#ff61df'
            }}>
              Couch
            </div>
            <button
              onClick={isSitting ? handleStandUp : handleRest}
              style={{
                background: 'linear-gradient(45deg, #ff61df, #ff00ff)',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '20px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 0 10px rgba(255, 97, 223, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              {isSitting ? 'Stand Up 🚶' : 'Rest 💺'}
            </button>
          </div>
        </Html>
      )}

      {message && (
        <Html
          position={[0, 2, 0.5]}
          center
          transform
          sprite
          occlude
        >
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '15px',
            borderRadius: '10px',
            border: '2px solid #ff61df',
            color: '#ff61df',
            boxShadow: '0 0 10px rgba(255, 97, 223, 0.5)',
            textAlign: 'center'
          }}>
            {message}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function NightClub() {
  const { isInside, playerPosition } = useGameStore();
  const [npcs] = useState([
    // Pink NPCs
    { id: 1, position: [-2, 1, 0], type: 'pink_long', isDancing: true },
    { id: 2, position: [2, 1, 2], type: 'pink_long', isDancing: true },
    { id: 3, position: [0, 1, -2], type: 'pink_long', isDancing: true },
    { id: 4, position: [-1, 1, 1], type: 'pink_long', isDancing: false },
    { id: 5, position: [1, 1, -1], type: 'pink_long', isDancing: true },
    // Blue spike NPCs
    { id: 6, position: [-3, 1, -2], type: 'blue_spike', isDancing: true },
    { id: 7, position: [3, 1, 0], type: 'blue_spike', isDancing: false },
    { id: 8, position: [0, 1, 2], type: 'blue_spike', isDancing: true },
    { id: 9, position: [-2, 1, -3], type: 'blue_spike', isDancing: true },
    { id: 10, position: [2, 1, -2], type: 'blue_spike', isDancing: false }
  ]);

  return (
    <>
      {/* Main structure */}
      <group>
        {/* Additional lighting for the dancefloor */}
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#ffffff" />
        <spotLight
          position={[0, 8, 0]}
          angle={Math.PI / 3}
          penumbra={1}
          intensity={1}
          color="#ffffff"
          castShadow
        />
        
        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        
        {/* Walls */}
        <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[20, 10]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[10, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[20, 10]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 5, -10]} receiveShadow>
          <planeGeometry args={[20, 10]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Entrance with neon sign */}
        <mesh position={[0, 5, 10]} rotation={[0, Math.PI, 0]} receiveShadow>
          <planeGeometry args={[20, 10]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Player Character - single instance */}
        {isInside && (
          <Character 
            position={playerPosition} 
            isPlayer={true} 
            characterType="player" 
            color="#ffffff" 
          />
        )}
        
        {/* Bathroom area */}
        <Bathroom position={[-8, 0, 5]} />
        
        {/* Lounge area with couch */}
        <Couch position={[8, 0, -5]} rotation={[0, -Math.PI / 4, 0]} />
        
        {/* Dance floor */}
        <DanceFloor />
        
        {/* Disco lights */}
        <DiscoLights />
        
      </group>
    </>
  );
} 