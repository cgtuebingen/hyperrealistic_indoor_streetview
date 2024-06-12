import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import {
    PointerLockControls,
    Splat,
    StatsGl
} from '@react-three/drei';
import { FirstPersonControls } from './FirstPersonControls.tsx'
import { Leva, useControls } from 'leva';
import { useMemo } from 'react'

const CanvasLayer = () => {

  const [splatExists, setSplatExists] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(true);
  const handleOverlayEnter = () => setIsPointerLocked(false);
  const handleOverlayLeave = () => setIsPointerLocked(true);

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


  const options = useMemo(() => {
    return {
      speed: { value: 100, min: 1, max: 500, step: 10 },
    }
  }, [])

  const splatOptions = useControls('Admin Panel', options);


  return (
    <div className="absolute w-full h-full">
      <div onMouseEnter={handleOverlayEnter} onMouseLeave={handleOverlayLeave}>
        <Leva oneLineLabels />
      </div>
      <Canvas>
        <StatsGl />
        <ambientLight />
        <pointLight position={[0, 0, 0]} />
        <FirstPersonControls speed={splatOptions.speed} />
        {isPointerLocked && <PointerLockControls />}
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
