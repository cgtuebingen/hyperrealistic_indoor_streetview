import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const FirstPersonControls = () => {
  const { camera } = useThree();
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
  }, []);

  useFrame((_, delta) => {
    // change this if you want to move faster / slower
    const movementSpeed = 300.0;
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

    camera.position.addScaledVector(velocity, delta);
    velocity.multiplyScalar(1 - 10.0 * delta);
  });

  return null;
};

