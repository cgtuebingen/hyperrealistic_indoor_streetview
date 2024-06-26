import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import {
    PointerLockControls,
    StatsGl
} from '@react-three/drei';
import { FirstPersonControls } from './FirstPersonControls.tsx'
import TeleportControls from './TeleportControls.tsx';
import { useFetcher, useLoaderData } from "@remix-run/react";

import { Splat } from './Splat.tsx';
import { Leva, useControls } from 'leva';
import { useMemo } from 'react'

const CanvasLayer = () => {

  const [splatExists, setSplatExists] = useState(false);
  const [splatUrls, setSplatUrls] = useState<string[]>([]);
  const [selectedSplat, setSelectedSplat] = useState<string>('');
  const [isPointerLocked, setIsPointerLocked] = useState(true);

  const teleportControlsRef = useRef();



  // fetch list of files from backend & filter them
  useEffect(() => {
    fetch('/files')
      .then(response => response.json())
      .then(data => setSplatUrls(data.filter(file => file.endsWith('.splat'))))
      .catch(error => console.error('Error fetching files:', error));
  }, []);

  // temp debug: just shows the files
  console.log(splatUrls);

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

  const handleSplatChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSplat(event.target.value);
  };

  const handleOverlayEnter = () => setIsPointerLocked(false);
  const handleOverlayLeave = () => setIsPointerLocked(true);

  const options = useMemo(() => {
    return {
      speed: { value: 100, min: 1, max: 500, step: 10 },
    }
  }, [])

  const splatOptions = useControls('Admin Panel', options);

  const handleTeleport = () => {
    if (teleportControlsRef.current) {
      // Test cooordinates
      teleportControlsRef.current.teleport(1, 1, 1);
    }
  };


  return (
    <div className="absolute w-full h-full">
      <div onMouseEnter={handleOverlayEnter} onMouseLeave={handleOverlayLeave}>
        <select
          value={selectedSplat}
          onChange={handleSplatChange}
          style={{margin:'0px 300px', position: 'absolute', zIndex: 10}}>
            <option value="">Select Splat</option>
            {splatUrls.map((url, index) => (
              <option key={index} value={url}>
                {url}
              </option>
            ))}
          </select>
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
        <Splat position={[0, 2, 1]} src={selectedSplat || "https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat"} />
      </Canvas>
    </div>
  );
};

export default CanvasLayer;
