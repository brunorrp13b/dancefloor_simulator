import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import useGameStore from '../store/gameStore';
import { NPC_TYPES } from '../store/gameStore';

// Add this at the top level of the file
let activeFlirtId = null;

function Hair({ type }) {
  if (type === NPC_TYPES.BLUE_SPIKE) {
    return (
      <group position={[0, 2.2, 0]}>
        {/* Spiky hair */}
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[
            Math.sin((i / 5) * Math.PI * 2) * 0.15,
            Math.random() * 0.2,
            Math.cos((i / 5) * Math.PI * 2) * 0.15
          ]}>
            <coneGeometry args={[0.05, 0.2, 4]} />
            <meshStandardMaterial color="#4169e1" />
          </mesh>
        ))}
      </group>
    );
  }
  return null;
}

function analyzeFlirtMessage(message) {
  // Simple sentiment analysis for flirt messages
  const positiveWords = ['love', 'beautiful', 'sweet', 'cute', 'amazing', 'wonderful', 'lovely', 'nice', 'pretty', 'charming'];
  const negativeWords = ['hate', 'ugly', 'bad', 'stupid', 'boring', 'weird', 'creepy', 'annoying', 'gross', 'terrible'];
  
  const words = message.toLowerCase().split(' ');
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 0.1;
    if (negativeWords.includes(word)) score -= 0.15;
  });
  
  return score;
}

function generateResponse(success, type) {
  const responses = {
    success: {
      pink: [
        "Your charm is irresistible! 💖",
        "That was so smooth! Let's dance! 💃",
        "You've got the moves AND the words! 😘",
        "Perfect timing! I love your style! ✨",
        "You're making my heart race! 💕"
      ],
      blue: [
        "Now that's what I call chemistry! ⚡",
        "You've got that special something! 🌟",
        "I can't resist your energy! 🔥",
        "You're exactly my type! 💫",
        "Let's make this night unforgettable! ✨"
      ]
    },
    failure: {
      pink: [
        "Maybe try a different approach? 🤔",
        "Not feeling it right now... 💔",
        "You'll need to do better than that! 😅",
        "Is that the best you've got? 🙄",
        "Let's just be dance partners... 💃"
      ],
      blue: [
        "Your game needs work! 🎮",
        "Not impressed... Try again! 🎯",
        "You're not my wavelength! 📻",
        "Keep practicing those moves! 🕺",
        "Maybe we should just dance? 🎵"
      ]
    }
  };
  
  const category = success ? 'success' : 'failure';
  const npcType = type === NPC_TYPES.PINK_LONG ? 'pink' : 'blue';
  const possibleResponses = responses[category][npcType];
  return possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
}

function ChatBox({ onFlirt, message, onMessageSubmit }) {
  const [flirtMessage, setFlirtMessage] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (flirtMessage.trim()) {
      onMessageSubmit(flirtMessage);
      setFlirtMessage('');
    }
  };
  
  return (
    <Html position={[0, 2.5, 0]} center>
      <div className="chat-box" style={{
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        color: 'white',
        width: '200px',
        textAlign: 'center'
      }}>
        {message ? (
          <p style={{ 
            margin: '0',
            color: message.includes('rejected') || message.includes('needs') ? '#ff4444' : '#44ff44',
            fontSize: '14px',
            padding: '5px'
          }}>{message}</p>
        ) : (
          <>
            <form onSubmit={handleSubmit} style={{ marginBottom: '10px' }}>
              <input
                type="text"
                value={flirtMessage}
                onChange={(e) => setFlirtMessage(e.target.value)}
                placeholder="Type your flirt message..."
                maxLength={50}
                style={{
                  width: '100%',
                  padding: '5px',
                  marginBottom: '5px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid #ff69b4',
                  borderRadius: '3px',
                  color: 'white'
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#ff69b4',
                  border: 'none',
                  padding: '5px 15px',
                  borderRadius: '3px',
                  color: 'white',
                  cursor: 'pointer',
                  marginRight: '5px'
                }}
              >
                Send 💌
              </button>
              <button
                type="button"
                onClick={onFlirt}
                style={{
                  background: '#ff69b4',
                  border: 'none',
                  padding: '5px 15px',
                  borderRadius: '3px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Quick Flirt 💋
              </button>
            </form>
          </>
        )}
      </div>
    </Html>
  );
}

function StickFigureNPC({ position, type, id }) {
  const npcRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const [showChat, setShowChat] = useState(false);
  const [flirtMessage, setFlirtMessage] = useState('');
  const [lastFlirtTime, setLastFlirtTime] = useState(0);
  
  const {
    playerPosition,
    nearbyNPC,
    setNearbyNPC,
    isDancing,
    emotionalState,
    increaseEmotionalState,
    energy
  } = useGameStore();
  
  useFrame((state) => {
    if (npcRef.current) {
      const time = state.clock.elapsedTime;
      
      // Check distance to player
      const distanceToPlayer = Math.sqrt(
        Math.pow(playerPosition[0] - position[0], 2) +
        Math.pow(playerPosition[2] - position[2], 2)
      );
      
      // Show chat if player is nearby and no active flirt or this is the active flirt
      const isNearby = distanceToPlayer < 2;
      const canShowChat = isNearby && (!activeFlirtId || activeFlirtId === id);
      setShowChat(canShowChat);
      
      if (isNearby && !activeFlirtId) {
        activeFlirtId = id;
        setNearbyNPC(id);
      } else if (!isNearby && activeFlirtId === id) {
        activeFlirtId = null;
        setNearbyNPC(null);
      }
      
      // Dancing animation
      npcRef.current.position.y = position[1] + Math.sin(time * 4) * 0.1;
      
      // Arm movements
      leftArmRef.current.rotation.z = Math.sin(time * 3) * 0.5 - Math.PI / 6;
      rightArmRef.current.rotation.z = Math.cos(time * 3) * 0.5 + Math.PI / 6;
      
      // Leg movements
      leftLegRef.current.rotation.x = Math.sin(time * 3) * 0.3;
      rightLegRef.current.rotation.x = Math.cos(time * 3) * 0.3;
    }
  });
  
  const handleQuickFlirt = () => {
    if (Date.now() - lastFlirtTime < 1000) return; // Prevent spam
    setLastFlirtTime(Date.now());
    
    if (energy <= 0) {
      setFlirtMessage("Too tired to flirt! Get an energy drink! 😴");
      setTimeout(() => setFlirtMessage(''), 2000);
      return;
    }
    
    if (activeFlirtId !== id) {
      setFlirtMessage("Can't flirt with multiple people! 🤨");
      setTimeout(() => setFlirtMessage(''), 2000);
      return;
    }
    
    const successChance = 0.1 + (isDancing ? 0.2 : 0) + (emotionalState * 0.003);
    handleFlirtAttempt(successChance);
  };
  
  const handleMessageFlirt = (message) => {
    if (energy <= 0) {
      setFlirtMessage("Too tired to flirt! Get an energy drink! 😴");
      setTimeout(() => setFlirtMessage(''), 2000);
      return;
    }
    
    if (activeFlirtId !== id) {
      setFlirtMessage("Can't flirt with multiple people! 🤨");
      setTimeout(() => setFlirtMessage(''), 2000);
      return;
    }
    
    const baseChance = 0.1 + (isDancing ? 0.2 : 0) + (emotionalState * 0.003);
    const messageBonus = analyzeFlirtMessage(message);
    const totalChance = Math.min(0.95, baseChance + messageBonus);
    
    handleFlirtAttempt(totalChance);
  };
  
  const handleFlirtAttempt = (chance) => {
    if (Math.random() < chance) {
      increaseEmotionalState();
      setFlirtMessage(generateResponse(true, type));
    } else {
      setFlirtMessage(generateResponse(false, type));
    }
    
    setTimeout(() => setFlirtMessage(''), 3000);
  };

  const npcColor = type === NPC_TYPES.PINK_LONG ? "#ffb6c1" : "#add8e6";

  return (
    <group ref={npcRef} position={position}>
      {showChat && (
        <ChatBox
          onFlirt={handleQuickFlirt}
          message={flirtMessage}
          onMessageSubmit={handleMessageFlirt}
        />
      )}
      
      <Hair type={type} />
      
      {/* Head */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={npcColor} />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.2]} />
        <meshStandardMaterial color={npcColor} />
      </mesh>
      
      {/* Arms */}
      <group position={[0, 1.8, 0]}>
        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.1, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 0.6]} />
            <meshStandardMaterial color={npcColor} />
          </mesh>
        </group>
        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 0.6]} />
            <meshStandardMaterial color={npcColor} />
          </mesh>
        </group>
      </group>
      
      {/* Legs */}
      <group position={[0, 0.8, 0]}>
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.1, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 0.8]} />
            <meshStandardMaterial color={npcColor} />
          </mesh>
        </group>
        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.1, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 0.8]} />
            <meshStandardMaterial color={npcColor} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function NPCs() {
  // Create multiple NPCs in a circle around the dance floor
  const npcPositions = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 4;
    return {
      position: [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ],
      type: i % 2 === 0 ? NPC_TYPES.PINK_LONG : NPC_TYPES.BLUE_SPIKE,
      id: `npc-${i}`
    };
  });

  return (
    <>
      {npcPositions.map((npc, index) => (
        <StickFigureNPC
          key={npc.id}
          position={npc.position}
          type={npc.type}
          id={npc.id}
        />
      ))}
    </>
  );
} 