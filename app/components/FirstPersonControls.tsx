import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const FirstPersonControls = (speed) => {
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
  const cameraHeight = 1.8;

  // temporary location for rooms, TODO: move this outside of the controller
  const rooms = [
    {
      minX: -50, maxX: 50, minY: 0, maxY: 20, minZ: -50, maxZ: 50,
      slopes: [],
      objects: [
        { minX: 10, maxX: 15, minY: 0, maxY: 15, minZ: 10, maxZ: 15 }
      ]
    },
    {
      minX: 50, maxX: 60, minY: 0, maxY: 10, minZ: 0, maxZ: 10,
      slopes: [
        { angle: Math.PI / 2, position: { x: 10, y: 5, z: 5 }, width: 5, length: 10 },
        { angle: Math.PI / 3, position: { x: 0, y: 0, z: 0 }, width: 10, length: 50 },
        { angle: Math.PI / 3, position: { x: 10, y: 5, z: 5 }, width: 5, length: 50 }

        ],
      objects: []
    },
    {
      minX: 60, maxX: 160, minY: 0, maxY: 20, minZ: -50, maxZ: 50,
      slopes: [],
      objects: []
    },
  ];

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

    // Add transparent boxes to visualize rooms and slopes
    rooms.forEach(room => {
      const roomGeometry = new THREE.BoxGeometry(
        room.maxX - room.minX,
        room.maxY - room.minY,
        room.maxZ - room.minZ
      );
      const roomMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.25,
        wireframe: true
      });
      const roomBox = new THREE.Mesh(roomGeometry, roomMaterial);
      roomBox.position.set(
        (room.minX + room.maxX) / 2,
        (room.minY + room.maxY) / 2,
        (room.minZ + room.maxZ) / 2
      );
      scene.add(roomBox);

      room.objects.forEach(object => {

          const objectGeometry = new THREE.BoxGeometry(
            object.maxX - object.minX,
            object.maxY - object.minY,
            object.maxZ - object.minZ
          );
          const objectMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.25,
            wireframe: true
          });
          const objectBox = new THREE.Mesh(objectGeometry, objectMaterial);
          objectBox.position.set(
            (room.minX + object.minX - room.maxX + object.maxX) / 2,
            (room.minY + object.minY - room.maxY + object.maxY) / 2,
            (room.minZ + object.minZ - room.maxZ + object.maxZ) / 2
          );
          objectBox.name = `object-${room.minX}-${room.maxX}-${room.minZ}-${room.maxZ}`;
          scene.add(objectBox);
        });

      // Add slopes to the scene
      room.slopes.forEach((slope, index) => {
        const slopeGeometry = new THREE.PlaneGeometry(slope.width, slope.length);
        const slopeMaterial = new THREE.MeshBasicMaterial({
          color: 0xcccccc,
          side: THREE.DoubleSide,
          wireframe: true
        });
        const slopeMesh = new THREE.Mesh(slopeGeometry, slopeMaterial);
        slopeMesh.rotation.x = -slope.angle;
        slopeMesh.position.set(
          room.minX + (room.maxX - room.minX) / 2 + slope.position.x,
          (room.minY + room.maxY) / 2 + slope.position.y,
          room.minZ + (room.maxZ - room.minZ) / 2 + slope.position.z
        );
        slopeMesh.name = `slope-${room.minX}-${room.maxX}-${room.minZ}-${room.maxZ}-${index}`;
        scene.add(slopeMesh);
      });

    });

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
