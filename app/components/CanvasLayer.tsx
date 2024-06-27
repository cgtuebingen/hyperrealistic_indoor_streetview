import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import {
    PointerLockControls,
    StatsGl
} from '@react-three/drei';
import { FirstPersonControls } from './FirstPersonControls.tsx'
import TeleportControls from './TeleportControls.tsx';

import { Splat } from './Splat.tsx';
import { Leva, useControls } from 'leva';
import { useMemo } from 'react'

const CanvasLayer = () => {

  const [splatExists, setSplatExists] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(true);
  const handleOverlayEnter = () => setIsPointerLocked(false);
  const handleOverlayLeave = () => setIsPointerLocked(true);

  const teleportControlsRef = useRef();

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

  const handleTeleport = () => {
    if (teleportControlsRef.current) {
      // Test cooordinates
      // (posX, posY, posZ, lookAtX, lookAtY, lookAtZ)
      teleportControlsRef.current.teleport(0, 0, 0, 0, 2, 1);
      // here you teleprot to pos 0,0,0 and look at pos 0,2,1
    }
  };


  return (
    <div className="absolute w-full h-full">
      <div onMouseEnter={handleOverlayEnter} onMouseLeave={handleOverlayLeave}>
        <Leva oneLineLabels />
        <button onClick={handleTeleport} style={{ margin: '0px 450px', position: 'absolute', zIndex: 10 }}>
          Teleport
        </button>
      </div>
      <Canvas>
        <StatsGl />
        <ambientLight />
        <pointLight position={[0, 0, 0]} />
        <FirstPersonControls speed={splatOptions.speed} />
        <TeleportControls ref={teleportControlsRef} />
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
