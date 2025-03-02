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
    decreaseEmotionalState,
    kissCount,
    currentAchievement,
    showKissAnimation,
    hideKissAnimation
  } = useGameStore();
  
  // Decrease emotional state over time
  useEffect(() => {
    const interval = setInterval(() => {
      decreaseEmotionalState();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [decreaseEmotionalState]);

  // Hide kiss animation after delay
  useEffect(() => {
    if (showKissAnimation) {
      const timer = setTimeout(() => {
        hideKissAnimation();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showKissAnimation, hideKissAnimation]);
  
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
          
          <div className="emotional-bar">
            <div className="emotional-label">EMOTIONAL STATE</div>
            <div className="emotional-container">
              <div
                className="emotional-fill"
                style={{ width: `${emotionalState}%` }}
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
            <div className="score-value">{danceScore}</div>
          </div>
          <div className="score-section">
            <div className="score-label">KISSES</div>
            <div className="score-value">{kissCount.toLocaleString()}</div>
            {currentAchievement && (
              <div className={`achievement-title ${currentAchievement.style}`}>
                {currentAchievement.title}
              </div>
            )}
          </div>
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