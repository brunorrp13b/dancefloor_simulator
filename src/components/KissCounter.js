import React from 'react';
import useGameStore from '../store/gameStore';

const KissAnimation = () => (
  <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
    <div className="animate-kiss text-9xl">💋</div>
    <div className="absolute text-4xl font-bold text-pink-500 animate-float">
      Kissed! +1
    </div>
  </div>
);

const KissCounter = () => {
  const { kissCount, showKissAnimation, currentAchievement } = useGameStore();

  return (
    <div className="fixed bottom-24 right-4 flex flex-col items-end gap-2">
      {/* Kiss Counter */}
      <div className="bg-black/50 p-3 rounded-lg backdrop-blur-sm">
        <div className="text-2xl font-bold text-pink-500">
          Kisses: {kissCount.toLocaleString()}
        </div>
      </div>

      {/* Kiss Animation */}
      {showKissAnimation && <KissAnimation />}

      {/* Achievement Display */}
      {currentAchievement && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="flex flex-col items-center gap-4 animate-achievement-appear">
            <div className="text-2xl font-bold text-yellow-400">
              🏆 New Achievement Unlocked! 🏆
            </div>
            <div className={currentAchievement.style}>
              {currentAchievement.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KissCounter; 