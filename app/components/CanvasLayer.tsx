import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import {
    PointerLockControls,
    StatsGl
} from '@react-three/drei';
import { FirstPersonControls } from './FirstPersonControls.tsx'
import { TeleportControls } from './TeleportControls.tsx';
import { UserInterfaceRenderer } from './UserInterfaceRenderer.tsx';
import { Splat } from './Splat.tsx';
import { Leva, useControls } from 'leva';
import { useMemo } from 'react'

const CanvasLayer = () => {

  const [splatExists, setSplatExists] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(true);
  const handleOverlayEnter = () => setIsPointerLocked(false);
  const handleOverlayLeave = () => setIsPointerLocked(true);

  const teleportControlsRef = useRef();

  const [currentRoom, setCurrentRoom] = useState('');
  const [currentSplats, setCurrentSplats] = useState([]);
  const [currentKey, setCurrentKey] = useState('');

  const updateCurrentRoom = (newRoom) => {

    if(currentRoom == newRoom || newRoom == '' || newRoom == undefined) {
        return;
    }
    setCurrentRoom(newRoom);
    // get adjacent splats from currentRoom
    if(newRoom.adjacent.length == 0) {
      setCurrentSplats(newRoom.splat);
    } else {
      setCurrentSplats([...newRoom.adjacent.map(adjacentName => {
        const adjacentRoom = roomConfig.find(room => room.name === adjacentName);
        return adjacentRoom ? adjacentRoom.splat : null;
      }).filter(splat => splat !== null), newRoom.splat]);
    }
    setCurrentKey(`${newRoom.name}${newRoom.adjacent.join('')}`)
  }

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
      debug: false,
    }
  }, [])

  const splatOptions = useControls('Admin Panel', options);

  const handleTeleport = () => {
    if (teleportControlsRef.current) {
      // Test coordinates
      // (posX, posY, posZ, lookAtX, lookAtY, lookAtZ)
      teleportControlsRef.current.teleport(0, 0, 5.3, 0, 1, 1);
      // here you teleport to pos 0,0,0 and look at pos 0,2,1
    }
  };

  // temporary location for rooms
  const roomConfig = [
      {
        splat: "https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat",
        name: "room1",
        adjacent: [],
        minX: -100, maxX: 100, minY: 0, maxY: 5, minZ: -100, maxZ: 100,
        slopes: [],
        objects: [],
        elements: {
          arrows: [],
          panes: [],
          windowarcs: []
        }
      }

  ];
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
        <FirstPersonControls speed={splatOptions.speed} rooms={roomConfig} updateCurrentRoom={updateCurrentRoom}/>
        <UserInterfaceRenderer rooms={roomConfig} debug={splatOptions.debug}/>
        <TeleportControls ref={teleportControlsRef} />
        {isPointerLocked && <PointerLockControls />}
        {currentSplats.length > 0 && <Splat position={[0, 0, 0]} src={currentSplats} key={currentKey} />}
      </Canvas>
    </div>
  );
};

export default CanvasLayer;
