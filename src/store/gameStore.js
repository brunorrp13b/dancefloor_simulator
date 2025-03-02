import { create } from 'zustand';

const DANCE_MOVES = {
  BASIC: 'basic',
  SPIN: 'spin',
  WAVE: 'wave',
  JUMP: 'jump'
};

const NPC_TYPES = {
  PINK_LONG: 'pink_long',
  BLUE_SPIKE: 'blue_spike'
};

// Floor collision boundaries
const FLOOR_BOUNDS = {
  minX: -10,
  maxX: 10,
  minZ: -10,
  maxZ: 10,
  y: 1 // Fixed floor height
};

// Updated wall definitions with proper collision handling
const WALLS = [
  // Main club walls
  { start: [-10, -10], end: [-10, 10] }, // Left wall
  { start: [10, -10], end: [10, 10] }, // Right wall
  { start: [-10, -10], end: [10, -10] }, // Back wall
  { start: [-10, 10], end: [10, 10] }, // Front wall
  
  // Bathroom walls
  { start: [-11, 3], end: [-5, 3] }, // Front wall
  { start: [-11, 7], end: [-5, 7] }, // Back wall
  { start: [-11, 3], end: [-11, 7] }, // Left wall
  { start: [-5, 3], end: [-5, 5] }, // Right wall bottom section
  { start: [-5, 6], end: [-5, 7] }, // Right wall top section
];

// Add new constants for game balance
const DANCE_MOVE_STATS = {
  [DANCE_MOVES.BASIC]: { energyCost: 0.5, scoreGain: 0.33, emotionalGain: 1.67 },
  [DANCE_MOVES.SPIN]: { energyCost: 0.75, scoreGain: 0.5, emotionalGain: 2, minConfidence: 30 },
  [DANCE_MOVES.WAVE]: { energyCost: 1, scoreGain: 0.67, emotionalGain: 2.33, minConfidence: 50 },
  [DANCE_MOVES.JUMP]: { energyCost: 1.5, scoreGain: 0.83, emotionalGain: 2.67, minConfidence: 70 }
};

const KISS_ACHIEVEMENTS = {
  NOVICE: { count: 1, title: "Kiss Novice", style: "text-xl font-bold text-pink-500" },
  NOVICE: { count: 10, title: "Kiss Expert", style: "text-xl font-bold text-pink-500" },
  INTERMEDIATE: { count: 50, title: "Love Whisperer", style: "text-2xl font-bold text-rose-600 animate-pulse" },
  ADVANCED: { count: 100, title: "Romance Virtuoso", style: "text-3xl font-bold text-purple-600 animate-bounce" },
  MASTER: { count: 500, title: "Heartbreaker Legend", style: "text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse" },
  GRANDMASTER: { count: 1000, title: "Love God", style: "text-5xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 animate-bounce shadow-lg" },
  DIVINE: { count: 10000, title: "Divine Seducer", style: "text-6xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600 animate-rainbow shadow-2xl" },
  CELESTIAL: { count: 100000, title: "Celestial Charmer", style: "text-7xl font-black bg-gradient-to-r from-rose-500 via-purple-600 to-blue-700 animate-cosmic shadow-3xl" },
  TRANSCENDENT: { count: 1000000, title: "Love Transcendent", style: "text-8xl font-black bg-gradient-to-r from-fuchsia-500 via-purple-800 to-violet-900 animate-universe shadow-4xl" },
  ETERNAL: { count: 1000000000000, title: "Eternal Love Emperor", style: "text-9xl font-black bg-gradient-to-r from-pink-600 via-purple-900 to-indigo-950 animate-eternal shadow-5xl" }
};

const useGameStore = create((set, get) => ({
  playerPosition: [0, 1, 9],
  playerRotation: [0, Math.PI, 0],
  playerVelocity: [0, 0, 0],
  isInside: true,
  musicVolume: 0.5,
  isDancing: false,
  isAtBar: false,
  isDJ: false,
  energy: 100,
  currentDanceMove: DANCE_MOVES.BASIC,
  danceScore: 0,
  emotionalState: 100,
  confidence: 100,
  lastKissTime: 0,
  lastActivityTime: Date.now(),
  nearbyNPC: null,
  isFlirting: false,
  isKeyboardLocked: false,
  showConfidenceMessage: false,
  isSitting: false,
  sittingAnimation: 0,
  isDoorOpen: false,
  rejectionCount: 0,
  isUnderAlcoholEffect: false,
  alcoholEffectTimer: null,
  alcoholEffectStart: null,
  isWashingFace: false,
  flirtCombo: 0,
  lastDanceMove: null,
  lastMoveChangeTime: Date.now(),
  faceWashCooldown: false,
  kissCount: 0,
  showKissAnimation: false,
  kissPosition: [0, 0],
  currentAchievement: null,
  
  buyAlcohol: () => {
    const state = get();
    if (state.danceScore >= 60) { // Increased cost
      set((state) => ({ danceScore: state.danceScore - 60 }));
      get().consumeAlcohol();
      return true;
    }
    return false;
  },
  
  setPlayerPosition: (newPosition) => {
    const { isDoorOpen, isSitting } = get();
    
    // Prevent movement while sitting
    if (isSitting) return;
    
    // Check collision with walls
    const isColliding = WALLS.some(wall => {
      // Skip collision check for the door area when the door is open
      if (isDoorOpen && 
          newPosition[0] >= -5.5 && newPosition[0] <= -4.5 && // Door width
          newPosition[2] >= 5 && newPosition[2] <= 6) { // Door area
        return false;
      }
      
      const distToWall = distanceToLine(
        newPosition[0],
        newPosition[2],
        wall.start[0],
        wall.start[1],
        wall.end[0],
        wall.end[1]
      );
      return distToWall < 0.5; // Player radius
    });
    
    if (!isColliding) {
      set({ playerPosition: newPosition });
    }
  },
  setPlayerRotation: (rotation) => set({ playerRotation: rotation }),
  setIsInside: (status) => set({ isInside: status }),
  setMusicVolume: (volume) => set({ musicVolume: volume }),
  setIsDancing: (status) => set((state) => ({ 
    isDancing: status,
    lastActivityTime: status ? Date.now() : state.lastActivityTime 
  })),
  setIsAtBar: (status) => set({ isAtBar: status }),
  setIsDJ: (status) => set({ isDJ: status }),
  
  decreaseEnergy: () => set((state) => {
    const timeSinceActivity = (Date.now() - Math.max(state.lastActivityTime, state.lastKissTime)) / 1000;
    const shouldDepleteEmotional = timeSinceActivity > 5;
    const moveStats = DANCE_MOVE_STATS[state.currentDanceMove];

    return {
      energy: Math.max(state.energy - (state.isDancing ? moveStats.energyCost : 0), 0),
      danceScore: state.isDancing ? state.danceScore + moveStats.scoreGain : state.danceScore,
      emotionalState: state.isDancing 
        ? Math.min(state.emotionalState + moveStats.emotionalGain, 100)
        : state.emotionalState
    };
  }),
  increaseEnergy: () => set((state) => ({ 
    energy: Math.min(state.energy + 20, 100) // Reduced rest energy gain
  })),
  
  setDanceMove: (move) => {
    const state = get();
    const moveStats = DANCE_MOVE_STATS[move];
    
    // Check confidence requirement
    if (moveStats.minConfidence && state.confidence < moveStats.minConfidence) {
      return false;
    }

    const now = Date.now();
    const timeSinceLastMove = (now - state.lastMoveChangeTime) / 1000;
    
    set((state) => ({
      currentDanceMove: move,
      lastDanceMove: state.currentDanceMove,
      lastMoveChangeTime: now,
      confidence: Math.min(state.confidence + 5, 100), // Confidence boost for changing moves
      emotionalState: Math.min(state.emotionalState + 10, 100), // Emotional boost for changing moves
      danceScore: timeSinceLastMove < 3 ? state.danceScore + 5 : state.danceScore // Bonus for quick moves change
    }));
    return true;
  },
  increaseDanceScore: (points) => set((state) => ({ danceScore: state.danceScore + points })),
  
  setNearbyNPC: (npc) => set({ nearbyNPC: npc }),
  setIsFlirting: (status) => set((state) => ({ 
    isFlirting: status,
    isKeyboardLocked: status // Lock keyboard when flirting starts
  })),
  
  increaseConfidence: () => set((state) => ({ 
    confidence: Math.min(state.confidence + 10, 100) // Reduced mirror boost
  })),
  decreaseConfidence: () => set((state) => ({ 
    confidence: Math.max(state.confidence - 25, 0) 
  })),
  
  increaseEmotionalState: () => set((state) => {
    // Trigger kiss animation when emotional state increases
    state.triggerKissAnimation();
    return { 
      emotionalState: Math.min(state.emotionalState + 20, 100) 
    };
  }),
  decreaseEmotionalState: () => set((state) => ({ 
    emotionalState: Math.max(state.emotionalState - 10, 0) 
  })),
  
  handleRejection: () => set((state) => {
    const newRejectionCount = state.rejectionCount + 1;
    const shouldReduceEmotional = newRejectionCount % 2 === 0; // Only decrease emotional state on even rejections
    
    return {
      rejectionCount: newRejectionCount,
      emotionalState: shouldReduceEmotional 
        ? Math.max(state.emotionalState - 10, 0)
        : state.emotionalState,
      energy: Math.max(0, state.energy - 10)
    };
  }),
  
  getFlirtSuccessChance: (state) => {
    const baseChance = 0.2; // Reduced base chance
    const danceBonus = state.isDancing ? 0.15 : 0;
    const emotionalBonus = state.emotionalState * 0.004;
    const confidenceBonus = state.confidence * 0.003;
    const comboBonus = Math.min(state.flirtCombo * 0.05, 0.25); // Up to 25% from combo
    return Math.min(0.9, baseChance + danceBonus + emotionalBonus + confidenceBonus + comboBonus);
  },
  
  setSitting: (status) => {
    if (status) {
      set({ isSitting: true });
      let progress = 0;
      const animate = () => {
        progress += 0.1;
        if (progress <= 1) {
          set({ sittingAnimation: progress });
          requestAnimationFrame(animate);
        }
      };
      animate();
    } else {
      let progress = 1;
      const animate = () => {
        progress -= 0.1;
        if (progress >= 0) {
          set({ sittingAnimation: progress });
          requestAnimationFrame(animate);
        } else {
          set({ isSitting: false });
        }
      };
      animate();
    }
  },
  
  setDoorOpen: (isOpen) => set({ isDoorOpen: isOpen }),

  consumeAlcohol: () => {
    const state = get();
    if (state.alcoholEffectTimer) {
      clearTimeout(state.alcoholEffectTimer);
    }

    set({
      energy: 100,
      confidence: 100,
      emotionalState: 100,
      isUnderAlcoholEffect: true,
      alcoholEffectStart: Date.now(),
      lastActivityTime: Date.now() // Reset activity timer when drinking
    });

    const timer = setTimeout(() => {
      set((state) => ({
        isUnderAlcoholEffect: false,
        alcoholEffectTimer: null,
        alcoholEffectStart: null
      }));
    }, 10000); // 10 seconds

    set({ alcoholEffectTimer: timer });
  },

  handleFlirt: (message) => {
    const state = get();
    let successRate = 0.3;
    let feedback = '';

    const hasCompliment = /beautiful|pretty|nice|cute|amazing|awesome/i.test(message);
    const hasPushPull = /but|however|though|although/i.test(message);
    const hasTease = /tease|playful|fun|joke/i.test(message);
    const hasInsult = /ugly|stupid|dumb|bad|worst|hate/i.test(message);

    if (hasInsult) {
      set((state) => ({
        confidence: Math.max(state.confidence - 20, 0),
        emotionalState: Math.max(state.emotionalState - 15, 0),
        rejectionCount: state.rejectionCount + 1,
        flirtCombo: 0
      }));
      return {
        success: false,
        response: "How dare you! You should learn some manners!",
        feedback: "Insulting people is never a good approach. Try being respectful and genuine."
      };
    }

    if (hasCompliment || hasPushPull || hasTease) {
      successRate = 0.5;
      feedback = "Good use of ";
      if (hasCompliment) feedback += "compliments! ";
      if (hasPushPull) feedback += "push-pull technique! ";
      if (hasTease) feedback += "playful teasing! ";
    }

    const isSuccess = Math.random() < get().getFlirtSuccessChance(state);

    if (!isSuccess) {
      set((state) => {
        const newRejectionCount = state.rejectionCount + 1;
        const shouldReduceConfidence = newRejectionCount % 2 === 0;
        
        return {
          rejectionCount: newRejectionCount,
          confidence: shouldReduceConfidence 
            ? Math.max(state.confidence * 0.75, 0)
            : state.confidence,
          flirtCombo: 0
        };
      });
    } else {
      const newKissCount = state.kissCount + 1;
      
      // Check for new achievements
      let newAchievement = null;
      for (const [level, data] of Object.entries(KISS_ACHIEVEMENTS)) {
        if (newKissCount === data.count) {
          newAchievement = { level, ...data };
          break;
        }
      }
      
      set((state) => ({
        lastActivityTime: Date.now(),
        lastKissTime: Date.now(),
        flirtCombo: state.flirtCombo + 1,
        confidence: Math.min(state.confidence + (state.flirtCombo > 0 ? 5 : 0), 100),
        kissCount: newKissCount,
        showKissAnimation: true,
        currentAchievement: newAchievement
      }));

      // Reset kiss animation after 2 seconds
      setTimeout(() => {
        set({ showKissAnimation: false });
      }, 2000);

      // Reset achievement display after 5 seconds
      if (newAchievement) {
        setTimeout(() => {
          set({ currentAchievement: null });
        }, 5000);
      }
    }

    const comboText = get().flirtCombo > 1 ? ` Combo x${get().flirtCombo}! ` : '';
    return {
      success: isSuccess,
      response: isSuccess ? 
        `That was smooth! I like your style! ${comboText}😊` : 
        "Sorry, not interested 😕",
      feedback: isSuccess ? 
        `${feedback}Keep it up!` : 
        `${feedback}Try being more creative and genuine. Remember to use compliments, teasing, or push-pull techniques.`
    };
  },

  updateAlcoholEffect: () => {
    const state = get();
    if (state.isUnderAlcoholEffect && state.alcoholEffectStart) {
      const elapsedTime = (Date.now() - state.alcoholEffectStart) / 1000; // Convert to seconds
      if (elapsedTime > 10) { // After 10 seconds
        set((state) => ({
          energy: Math.max(state.energy - 0.5, 0),
          confidence: Math.max(state.confidence - 0.3, 0),
          emotionalState: Math.max(state.emotionalState - 0.4, 0)
        }));
      }
    }
  },

  setWashingFace: (status) => set({ isWashingFace: status }),
  
  washFace: () => {
    const state = get();
    if (!state.isWashingFace && !state.faceWashCooldown) {
      set((state) => ({
        energy: Math.min(state.energy + 15, 100),
        isWashingFace: true,
        faceWashCooldown: true
      }));
      
      // Reset washing state after 2 seconds
      setTimeout(() => {
        set({ isWashingFace: false });
      }, 2000);

      // Reset cooldown after 10 seconds
      setTimeout(() => {
        set({ faceWashCooldown: false });
      }, 10000);
      
      return true;
    }
    return false;
  },

  triggerKissAnimation: () => set((state) => ({
    showKissAnimation: true,
    kissCount: state.kissCount + 1,
    lastKissTime: Date.now()
  })),

  hideKissAnimation: () => set({
    showKissAnimation: false
  }),

  processNPCInteraction: (message, npcType, messageCount) => {
    const state = get();
    const positiveWords = ['love', 'beautiful', 'sweet', 'cute', 'amazing', 'wonderful', 'lovely', 'nice', 'pretty', 'charming', 'dance'];
    const negativeWords = ['hate', 'ugly', 'bad', 'stupid', 'boring', 'weird', 'creepy', 'annoying', 'gross', 'terrible'];
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', '?'];
    
    // Analyze message
    const words = message.toLowerCase().split(' ');
    let score = 0;
    let isQuestion = false;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.2;
      if (negativeWords.includes(word)) score -= 0.3;
      if (questionWords.includes(word)) isQuestion = true;
    });

    // Add bonuses
    if (state.isDancing) score += 0.2;
    score += state.emotionalState * 0.003;
    score += state.confidence * 0.002;

    // Determine if this should be a final response
    const isFinal = messageCount >= 2 || Math.abs(score) > 0.5;

    // Generate response based on score and message count
    let response = {
      text: '',
      success: false,
      isFinal: isFinal
    };

    if (score < -0.3) {
      response.text = "That was really rude! I'm out of here! 😠";
      response.isFinal = true;
      get().handleRejection();
    } else if (score > 0.5) {
      response.text = npcType === NPC_TYPES.PINK_LONG ? 
        "You're absolutely charming! Let's dance! 💃✨" :
        "Now that's what I call chemistry! Let's hit the dance floor! 🕺✨";
      response.success = true;
      response.isFinal = true;
    } else if (isQuestion && messageCount < 2) {
      response.text = npcType === NPC_TYPES.PINK_LONG ?
        "Interesting question! What made you ask that? 🤔" :
        "Hmm, that's a good point. Tell me more! 🎵";
      response.success = true;
      response.isFinal = false;
    } else if (score > 0) {
      response.text = npcType === NPC_TYPES.PINK_LONG ?
        "That's sweet! Keep talking... 💖" :
        "You've got my attention! Go on... ⚡";
      response.success = true;
      response.isFinal = false;
    } else {
      response.text = "I'm not sure about that... Maybe try a different approach? 🤨";
      response.isFinal = messageCount >= 2;
    }

    // Apply game effects
    if (response.success) {
      set((state) => ({
        emotionalState: Math.min(state.emotionalState + 10, 100),
        confidence: Math.min(state.confidence + 5, 100),
        flirtCombo: state.flirtCombo + 1
      }));
    } else if (response.isFinal) {
      get().handleRejection();
    }

    return response;
  }
}));

// Helper function to calculate distance from point to line segment
function distanceToLine(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  
  if (len_sq !== 0) {
    param = dot / len_sq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
}

export { DANCE_MOVES, NPC_TYPES };
export default useGameStore; 