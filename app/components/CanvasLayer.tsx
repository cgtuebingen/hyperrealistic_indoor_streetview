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
    console.log(newRoom);
    console.log(currentSplats);
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
      teleportControlsRef.current.teleport(0, 0, 0, 0, 2, 1);
      // here you teleport to pos 0,0,0 and look at pos 0,2,1
    }
  };

  // temporary location for rooms
  const roomConfig = [
      {
        splat: "nuke_2.splat",
        name: "raum2",
        adjacent: ["raum1"],
        minX: -2, maxX: 1, minY: 0, maxY: 5, minZ: 5, maxZ: 5.65,
        slopes: [],
        objects: [],
        elements: {
          arrows: [],
          panes: [
            { position: { x: -40, y: -5, z: -40}, verticalRotation: Math.PI / 6, horizontalRotation: Math.PI/4, sizefactor: 10, content: "/images/testbild.png"},
          ],
          windowarcs: [
            { position: { x: 40, y: 0, z: -40}, horizontalRotation: Math.PI / 4, arcRadius: 10, arcHeight: 20, content: "/images/testbild.png"}
          ]
        }
      },
      {
        splat: "nuke_1.splat",
        name: "raum1",
        adjacent: [],
        minX: -2, maxX: 1, minY: 0, maxY: 5, minZ: 2, maxZ: 5,
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
        {currentSplats.length > 0 && <Splat position={[0, 0, 5]} src={currentSplats} key={currentKey} />}
      </Canvas>
    </div>
  );
};

export default CanvasLayer;
