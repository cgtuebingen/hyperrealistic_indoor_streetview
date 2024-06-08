import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import {
    PointerLockControls,
    StatsGl
} from '@react-three/drei';
import { FirstPersonControls } from './FirstPersonControls.tsx'
import { Splat } from './Splat.tsx';

const CanvasLayer = () => {

  const [splatExists, setSplatExists] = useState(false);

  useEffect(() => {
    const checkFileExists = async () => {
      try {
        const response = await fetch('/splat.splat');
        if (response.ok) {
          setSplatExists(true);
        } else {
          setSplatExists(false);
        }
      } catch (error) {
        setSplatExists(false);
      }
    }

    checkFileExists();
  }, []);

  return (
    <div className="absolute w-full h-full">
      <Canvas>
        <StatsGl />
        <ambientLight />
        <pointLight position={[0, 0, 0]} />
        <FirstPersonControls />
        <PointerLockControls />
        {splatExists &&
        <Splat  position={[0, 2, 1]} src="splat.splat" /> }
        {!splatExists &&
        <Splat
        position={[0, 2, 1]}
        src="https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat" />}
      </Canvas>
    </div>
  );
};

export default CanvasLayer;
