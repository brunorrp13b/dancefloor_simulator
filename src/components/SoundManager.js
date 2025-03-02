import React, { useState, useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';

// Free techno track from pixabay or similar free music site
const MUSIC_URL = 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3';

export default function SoundManager() {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const { isInside, musicVolume, setMusicVolume } = useGameStore();

  useEffect(() => {
    // Create audio element
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audioRef.current = audio;

    // Start playing when component mounts
    audio.play().catch(error => {
      console.log('Audio autoplay failed:', error);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      // Adjust volume based on whether player is inside and mute state
      const targetVolume = isInside ? musicVolume : musicVolume * 0.3;
      audioRef.current.volume = isMuted ? 0 : targetVolume;
    }
  }, [isInside, musicVolume, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const adjustVolume = (e) => {
    const newVolume = parseFloat(e.target.value);
    setMusicVolume(newVolume);
  };

  return (
    <div className="sound-controls" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '10px',
      borderRadius: '8px',
      color: 'white',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      <button
        onClick={toggleMute}
        style={{
          background: '#ff00ff',
          border: 'none',
          padding: '8px',
          borderRadius: '4px',
          cursor: 'pointer',
          color: 'white'
        }}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={musicVolume}
        onChange={adjustVolume}
        style={{
          width: '100px'
        }}
      />
    </div>
  );
} 