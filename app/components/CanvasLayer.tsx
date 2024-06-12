import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import {
    PointerLockControls,
    Splat,
    StatsGl
} from '@react-three/drei';
import { FirstPersonControls } from './FirstPersonControls.tsx'
import { useFetcher, useLoaderData } from "@remix-run/react";

const CanvasLayer = () => {

  const [splatExists, setSplatExists] = useState(false);
  const [splatUrls, setSplatUrls] = useState<string[]>([]);
  const [selectedSplat, setSelectedSplat] = useState<string>('');
  const [isPointerLocked, setIsPointerLocked] = useState(true);

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
      </div>
      <Canvas>
        <StatsGl />
        <ambientLight />
        <pointLight position={[0, 0, 0]} />
        <FirstPersonControls />
        {isPointerLocked && <PointerLockControls />}
        <Splat position={[0, 2, 1]} src={selectedSplat || "https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat"} />
      </Canvas>
    </div>
  );
};

export default CanvasLayer;
