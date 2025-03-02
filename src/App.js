import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Effects
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Character from './components/Character';
import NightClub from './components/NightClub';
import NPCs from './components/NPCs';
import Decorations from './components/Decorations';
import DJBooth from './components/DJBooth';
import SoundManager from './components/SoundManager';
import UI from './components/UI';
import usePlayerControls from './hooks/usePlayerControls';
import Barman from './components/Barman';
import './App.css';

function Scene() {
  usePlayerControls();

  return (
    <>
      <Environment preset="night" />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />
      <spotLight
        position={[5, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        castShadow
      />
      
      {/* Game Elements */}
      <NightClub />
      <NPCs />
      <Decorations />
      <DJBooth />
      
      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          intensity={1.0}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
        />
      </EffectComposer>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 5, 15]} />
          <OrbitControls
            target={[0, 1, 0]}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={20}
          />
          <Scene />
        </Suspense>
      </Canvas>
      <SoundManager />
      <UI />
      
      {/* Instructions overlay */}
      <div className="instructions">
        <h2>Welcome to Club Simulator!</h2>
        <p>WASD - Move around</p>
        <p>Mouse - Look around</p>
        <p>Space - Dance</p>
        <p>E - Get drinks at the bar</p>
        <p>1-4 - Dance moves</p>
        <p>Keep an eye on your energy level!</p>
      </div>
    </div>
  );
}

export default App;
