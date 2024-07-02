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

  const updateCurrentRoom = (newRoom) => {
    setCurrentRoom(newRoom);
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
      // Test cooordinates
      // (posX, posY, posZ, lookAtX, lookAtY, lookAtZ)
      teleportControlsRef.current.teleport(0, 0, 0, 0, 2, 1);
      // here you teleprot to pos 0,0,0 and look at pos 0,2,1
    }
  };

    // temporary location for rooms
    const roomConfig = [
      {
        minX: -50, maxX: 50, minY: 0, maxY: 20, minZ: -50, maxZ: 50,
        slopes: [
          { angle: Math.PI / 3 , position: { x: 0, y: 0, z: 0 }, width: 10 },
          { angle: Math.PI / 3, position: { x: 10, y: 0, z: 0 }, width: 10 }
        ],
        objects: [
          { minX: 10, maxX: 15, minY: 0, maxY: 15, minZ: 10, maxZ: 15 }
        ],
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
        minX: 50, maxX: 60, minY: 0, maxY: 10, minZ: 0, maxZ: 10,
        slopes: [
          { angle: Math.PI / 2, position: { x: 10, y: 5, z: 5 }, width: 5, length: 10 },
          { angle: Math.PI / 3, position: { x: 0, y: 0, z: 0 }, width: 10, length: 50 },
          { angle: Math.PI / 3, position: { x: 10, y: 5, z: 5 }, width: 5, length: 50 }

          ],
        objects: [],
        elements: {
          arrows: [],
          panes: [],
          windowarcs: []
        }
      },
      {
        minX: 60, maxX: 160, minY: 0, maxY: 20, minZ: -50, maxZ: 50,
        slopes: [],
        objects: [],
        elements: {
          arrows: [
            { position: { x: 0, y: -10, z: 0 }, graphName: "P0" },
            { position: { x: 0, y: -10, z: -20 }, graphName: "P1" },
            { position: { x: 0, y: -10, z: -40 }, graphName: "P2" },
            { position: { x: 15, y: -10, z: -20 }, graphName: "P3" },
            { position: { x: 35, y: -10, z: -40 }, graphName: "P4" },
            { position: { x: 0, y: -10, z: -55 }, graphName: "P5" }],
          panes: [],
          windowarcs: []
        }
      },
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
