import React, { useEffect } from 'react';
import useGameStore from '../store/gameStore';
import { DANCE_MOVES } from '../store/gameStore';

export default function UI() {
  const {
    energy,
    isDancing,
    isAtBar,
    isDJ,
    isInside,
    currentDanceMove,
    danceScore,
    emotionalState,
    confidence,
    kissCount,
    currentAchievement,
    showKissAnimation,
    hideKissAnimation
  } = useGameStore();
  
  // Log when achievement changes
  useEffect(() => {
    if (currentAchievement) {
      console.log('Achievement received:', currentAchievement);
    }
  }, [currentAchievement]);
  
  // Hide kiss animation after delay
  useEffect(() => {
    if (showKissAnimation) {
      const timer = setTimeout(() => {
        hideKissAnimation();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showKissAnimation, hideKissAnimation]);

  // Get achievement style class based on name
  const getAchievementClass = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('kiss')) return 'achievement-kiss';
    if (lowerTitle.includes('dance')) return 'achievement-dance';
    if (lowerTitle.includes('flirt')) return 'achievement-flirt';
    if (lowerTitle.includes('love')) return 'achievement-love';
    if (lowerTitle.includes('master')) return 'achievement-master';
    if (lowerTitle.includes('pro')) return 'achievement-pro';
    return 'achievement-default';
  };
  
  return (
    <div className="game-ui">
      {showKissAnimation && (
        <div className="kiss-animation">
          <div className="kiss">💋</div>
        </div>
      )}
      <div className="status-bar">
        <div className="bars-container">
          <div className="energy-bar">
            <div className="energy-label">ENERGY</div>
            <div className="energy-container">
              <div
                className="energy-fill"
                style={{ width: `${energy}%` }}
              />
            </div>
          </div>
          
          <div className="confidence-bar">
            <div className="confidence-label">CONFIDENCE</div>
            <div className="confidence-container">
              <div
                className="confidence-fill"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="score-display">
          <div className="score-section">
            <div className="score-label">DANCE SCORE</div>
            <div className="score-value">{Math.ceil(danceScore)}</div>
          </div>
          <div className="score-section">
            <div className="score-label">KISSES</div>
            <div className="score-value">{kissCount.toLocaleString()}</div>
          </div>
          {currentAchievement && (
            <div className="achievement-container">
              <div 
                className={`achievement-title ${getAchievementClass(currentAchievement.title)}`}
                style={{ opacity: 1 }} // Ensure visibility
              >
                {currentAchievement.title}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {isInside && (
        <div className="status-messages">
          {isDancing && (
            <div className="status-message">
              🕺 Dancing: {currentDanceMove.toUpperCase()}
            </div>
          )}
          {isAtBar && <div className="status-message">🍹 At the Bar</div>}
          {isDJ && <div className="status-message">🎧 DJ Mode</div>}
          {energy < 20 && (
            <div className="status-message warning">
              ⚠️ Low Energy! Visit the bar to recharge!
            </div>
          )}
        </div>
      )}
      
      <div className="controls-help">
        <p>WASD - Move | Space - Dance</p>
        <p>Dance Moves: 1 - Basic | 2 - Spin | 3 - Wave | 4 - Jump</p>
        <p>Get close to other dancers to interact!</p>
        <p>Visit the mirror to build confidence!</p>
      </div>
    </div>
  );
} 