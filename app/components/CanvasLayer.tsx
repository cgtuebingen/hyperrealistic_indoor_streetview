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
