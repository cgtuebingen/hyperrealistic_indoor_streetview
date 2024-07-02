import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const FirstPersonControls = ({ speed, rooms, updateCurrentRoom }) => {
  const { camera, scene } = useThree();
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const moveUp = useRef(false);
  const moveDown = useRef(false);
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const left = new THREE.Vector3();
  const forward = new THREE.Vector3();

  // Desired height above the ground
  const cameraHeight = 5;

  useEffect(() => {
    const onKeyDown = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward.current = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveBackward.current = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = true;
          break;
        case 'KeyE':
        case 'Space':
          moveUp.current = true;
          break;
        case 'KeyQ':
        case 'ShiftLeft':
        case 'ShiftRight':
          moveDown.current = true;
          break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward.current = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveBackward.current = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = false;
          break;
        case 'KeyE':
        case 'Space':
          moveUp.current = false;
          break;
        case 'KeyQ':
        case 'ShiftLeft':
        case 'ShiftRight':
          moveDown.current = false;
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [rooms, scene]);

  useFrame((_, delta) => {
    const movementSpeed = speed.speed ?? 300;

    // Get the camera's forward and left direction
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    left.crossVectors(camera.up, forward).normalize();

    direction.set(0, 0, 0);

    if (moveForward.current) direction.add(forward);
    if (moveBackward.current) direction.sub(forward);
    if (moveLeft.current) direction.add(left);
    if (moveRight.current) direction.sub(left);
    if (moveUp.current) direction.y += 1;
    if (moveDown.current) direction.y -= 1;

    direction.normalize();

    if (moveForward.current || moveBackward.current || moveLeft.current || moveRight.current || moveUp.current || moveDown.current) {
      velocity.addScaledVector(direction, movementSpeed * delta);
    }

    let newPosition = camera.position.clone().addScaledVector(velocity, delta);

    // find the room the user is currently in
    let currentRoom = rooms.find(room =>
      camera.position.x >= room.minX && camera.position.x <= room.maxX &&
      camera.position.y >= room.minY && camera.position.y <= room.maxY &&
      camera.position.z >= room.minZ && camera.position.z <= room.maxZ
    );

    updateCurrentRoom(currentRoom);

    // find the room the user might be going into
    const nextRoom = rooms.find(room =>
      newPosition.x >= room.minX && newPosition.x <= room.maxX &&
      newPosition.y >= room.minY && newPosition.y <= room.maxY &&
      newPosition.z >= room.minZ && newPosition.z <= room.maxZ
    );

    // Boundary checks for objects in the room
    const object = currentRoom.objects.find(object =>
      newPosition.x >= currentRoom.minX + object.minX  && newPosition.x <= currentRoom.minX + object.minX + (object.maxX - object.minX) &&
      newPosition.y >= currentRoom.minY + object.minY - 10 && newPosition.y <= currentRoom.minY + object.minY - 10 + (object.maxY - object.minY) &&
      newPosition.z >= currentRoom.minZ + object.minZ && newPosition.z <= currentRoom.minZ + object.minZ + (object.maxZ - object.minZ)
    );

    if (object) {
        newPosition = camera.position;
    }

    // detect if user is going into another room
    if (currentRoom && nextRoom && currentRoom !== nextRoom) {
      currentRoom = nextRoom;
    }

    if (currentRoom && !object) {
      // Boundary checks for the current room
      newPosition.x = Math.max(currentRoom.minX, Math.min(currentRoom.maxX, newPosition.x));
      newPosition.z = Math.max(currentRoom.minZ, Math.min(currentRoom.maxZ, newPosition.z));

      // Calculate ground height using a raycaster and specific slopes
      const raycaster = new THREE.Raycaster(newPosition.clone().setY(100), new THREE.Vector3(0, -1, 0));
      let groundHeight = currentRoom.minY;
      let foundGround = false;

      for (let i = 0; i < currentRoom.slopes.length; i++) {
        const slopeObject = scene.getObjectByName(`slope-${currentRoom.minX}-${currentRoom.maxX}-${currentRoom.minZ}-${currentRoom.maxZ}-${i}`);
        if (slopeObject) {
          const intersects = raycaster.intersectObject(slopeObject, true);
          if (intersects.length > 0) {
            groundHeight = Math.max(groundHeight, intersects[0].point.y);
            foundGround = true;
          }
        }
      }

      if (!foundGround) {
        groundHeight = currentRoom.minY;
      }

      newPosition.y = groundHeight + cameraHeight;

      // Clamp Y position to the room boundaries
      newPosition.y = Math.max(currentRoom.minY + cameraHeight, Math.min(currentRoom.maxY, newPosition.y));
    }

    camera.position.copy(newPosition);

    velocity.multiplyScalar(1 - 10.0 * delta);
  });

  return null;
};
