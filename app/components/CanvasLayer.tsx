import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls, StatsGl } from '@react-three/drei';
import { FirstPersonControls } from './FirstPersonControls.tsx';
import { Splat } from './Splat.tsx';
import { Leva, useControls } from 'leva';

const CanvasLayer = () => {
  const [splatExists, setSplatExists] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(true);
  const [splatUrls, setSplatUrls] = useState<string[]>([]);
  const [selectedSplat, setSelectedSplat] = useState<string>('');

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
    };

    checkFileExists();
  }, []);

  // fetch list of files from backend & filter them
  useEffect(() => {
    fetch('/files')
      .then(response => response.json())
      .then(data => setSplatUrls(data.filter((file: string) => file.endsWith('.splat'))))
      .catch(error => console.error('Error fetching files:', error));
  }, []);

  const options = useMemo(() => {
    return {
      speed: { value: 100, min: 1, max: 500, step: 10 },
    };
  }, []);

  const splatOptions = useControls('Admin Panel', options);

  const handleSplatChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSplat(event.target.value);
  };

  return (
    <div className="absolute w-full h-full">
      <div onMouseEnter={handleOverlayEnter} onMouseLeave={handleOverlayLeave}>
        <Leva oneLineLabels />
        <select
          value={selectedSplat} onChange={handleSplatChange}
          style={{margin: '0px 300px'}}>
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
        <FirstPersonControls speed={splatOptions.speed} />
        {isPointerLocked && <PointerLockControls />}
        <Splat position={[0, 2, 1]} src={selectedSplat || "https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat"} />
      </Canvas>
    </div>
  );
};

export default CanvasLayer;
