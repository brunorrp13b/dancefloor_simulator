import { useEffect } from 'react';
import useGameStore from '../store/gameStore';
import { DANCE_MOVES } from '../store/gameStore';

export default function usePlayerControls() {
  const {
    playerPosition,
    setPlayerPosition,
    setIsDancing,
    setIsAtBar,
    setIsDJ,
    decreaseEnergy,
    increaseEnergy,
    energy,
    isDancing,
    setDanceMove,
    increaseDanceScore,
    isInside,
    setIsInside,
    isKeyboardLocked
  } = useGameStore();
  
  // Check if player is inside the club
  useEffect(() => {
    const checkIfInside = () => {
      const isInClubArea = 
        playerPosition[0] >= -9 &&
        playerPosition[0] <= 9 &&
        playerPosition[2] >= -9 &&
        playerPosition[2] <= 9;
      
      setIsInside(isInClubArea);
    };
    
    checkIfInside();
  }, [playerPosition, setIsInside]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // If keyboard is locked (during flirting), only allow Enter and Escape
      if (isKeyboardLocked && e.key !== 'Enter' && e.key !== 'Escape') {
        return;
      }

      const speed = 0.5;
      const newPosition = [...playerPosition];
      let moved = false;
      
      switch (e.key.toLowerCase()) {
        case 'w':
        case 's':
        case 'a':
        case 'd':
          if (isDancing) {
            setIsDancing(false);
            return;
          }
          const newPosition = [...playerPosition];
          let moved = false;
          
          switch (e.key.toLowerCase()) {
            case 'w':
              newPosition[2] -= speed;
              moved = true;
              break;
            case 's':
              newPosition[2] += speed;
              moved = true;
              break;
            case 'a':
              newPosition[0] -= speed;
              moved = true;
              break;
            case 'd':
              newPosition[0] += speed;
              moved = true;
              break;
          }
          
          if (moved) {
            // Boundary checks
            newPosition[0] = Math.max(-12, Math.min(12, newPosition[0]));
            newPosition[2] = Math.max(-12, Math.min(12, newPosition[2]));
            setPlayerPosition(newPosition);
          }
          break;
        case ' ':
          // Toggle dancing only if inside and has energy
          if (isInside && energy > 0) {
            setIsDancing(!isDancing);
            if (!isDancing) {
              setDanceMove(DANCE_MOVES.BASIC);
            }
          }
          break;
        // Dance moves only work if already dancing and inside
        case '1':
          if (isDancing && isInside) {
            setDanceMove(DANCE_MOVES.BASIC);
          }
          break;
        case '2':
          if (isDancing && isInside && energy > 10) {
            setDanceMove(DANCE_MOVES.SPIN);
            increaseDanceScore(1);
          }
          break;
        case '3':
          if (isDancing && isInside && energy > 20) {
            setDanceMove(DANCE_MOVES.WAVE);
            increaseDanceScore(2);
          }
          break;
        case '4':
          if (isDancing && isInside && energy > 30) {
            setDanceMove(DANCE_MOVES.JUMP);
            increaseDanceScore(3);
          }
          break;
        default:
          return;
      }
      
      if (moved) {
        // Boundary checks
        newPosition[0] = Math.max(-12, Math.min(12, newPosition[0]));
        newPosition[2] = Math.max(-12, Math.min(12, newPosition[2]));
        setPlayerPosition(newPosition);
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() === 'e') {
        setIsAtBar(false);
        setIsDJ(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Decrease energy while dancing
    const energyInterval = setInterval(() => {
      if (isDancing) {
        decreaseEnergy();
        if (energy <= 0) {
          setIsDancing(false);
        }
      }
    }, 100);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(energyInterval);
    };
  }, [
    playerPosition,
    setPlayerPosition,
    setIsDancing,
    setIsAtBar,
    setIsDJ,
    decreaseEnergy,
    increaseEnergy,
    energy,
    isDancing,
    setDanceMove,
    increaseDanceScore,
    isInside
  ]);
} 