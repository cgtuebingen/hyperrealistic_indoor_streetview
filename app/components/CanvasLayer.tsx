import {
  Environment,
  Gltf,
  PointerLockControls,
  PerformanceMonitor,
  StatsGl,
} from '@react-three/drei';
import { Canvas, useFrame, useThree,  } from '@react-three/fiber';
import { Box } from './box';
import { Splat } from './splat-object';
import { OrbitingSuzi } from './suzi';
import { Leva, useControls } from 'leva';
import * as THREE from 'three';
import React, { useState, useEffect, useRef } from 'react';
const FirstPersonControls = () => {
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
    const movementSpeed = 400.0;
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

const gltfUrls = [
  // telco
] as const;

const splatUrls = [

  // output,

  // telco_2_42k,
  // telco_2_28k,
  // telco_2_21k,
  // telco_2_14k,
  // telco_2_7k,
  // telco4200k,
  // telco463k,
  // telco456k,
  // telco449k,
  // telco442k,
  // telco435k,
  // telco428k,
  // telco421k,
  // telco414k,
  // telco30k,
  // telco21k,
  // telco14k,
  // telco7k,
  // model30k,

  'https://antimatter15.com/splat-data/train.splat',
  'https://antimatter15.com/splat-data/plush.splat',
  'https://antimatter15.com/splat-data/truck.splat',
  'https://antimatter15.com/splat-data/garden.splat',
  'https://antimatter15.com/splat-data/treehill.splat',
  'https://antimatter15.com/splat-data/stump.splat',
  'https://antimatter15.com/splat-data/bicycle.splat',
  'https://media.reshot.ai/models/nike_next/model.splat',
] as const;


const CanvasLayer = () => {

  const [splatExists, setSplatExists] = useState(false);

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
  const splatUrl = 'https://antimatter15.com/splat-data/train.splat';
  const { gltfUrl, throttleDpr, maxDpr, throttleSplats, maxSplats } = useControls({
    splatUrl: { label: 'Splat URL', options: splatUrls },
    gltfUrl: { label: "Gltf URL", options: gltfUrls },
    throttleDpr: {
      label: 'Degrade pixel ratio based on perf.',
      value: false,
    },
    maxDpr: { label: 'Max pixel ratio', value:  1 },
    throttleSplats: {
      label: 'Degrade splat count based on perf.',
      value: false,
    },
    maxSplats: { label: 'Max splat count', value: 10000000 },
  }) as any;

  // Performance factor
  const [factor, setFactor] = useState(1);

  // Downsample pixels if perf gets bad
  // const [dpr, setDpr] = useState(maxDpr);
  const dpr = Math.min(maxDpr, Math.round(0.5 + 1.5 * factor));
  const effectiveDpr = throttleDpr ? Math.min(maxDpr, dpr) : maxDpr;

  // Downsample splats if perf gets bad
  const [splats, setSplats] = useState(maxSplats);
  // const splats =
  const effectiveSplats = throttleSplats
    ? Math.min(maxSplats, splats)
    : maxSplats;

  const splatScale = 2.7 as number;
  const splatPos = [12.1 + 0, 19.3, -1.0] as [number, number, number];
  const splatRot = [-0.516, 0.15, 0.1] as [number, number, number];

  return (
    <>
      <Leva oneLineLabels collapsed />
      <div className="absolute w-full h-full">
      <Canvas
        gl={{ antialias: false }}
        dpr={effectiveDpr}
      >
        <PerformanceMonitor
          ms={250}
          iterations={1}
          step={1}
          onIncline={({ factor }) => {
            setFactor(factor);
            setSplats(() =>
              Math.min(
                maxSplats,
                Math.round((0.9 + 0.2 * factor) * effectiveSplats)
              )
            );
          }}
          onDecline={({ factor }) => {
            setFactor(factor);
            setSplats(() =>
              Math.min(
                maxSplats,
                Math.round((0.9 + 0.2 * factor) * effectiveSplats)
              )
            );
          }}
        />

        <StatsGl />

        <FirstPersonControls />
        <PointerLockControls />

        <Splat url={splatUrl} maxSplats={effectiveSplats} />
      </Canvas>
      </div>
      <div className="absolute bottom-0 left-0 rounded-lg bg-white shadow border-gray-200 bg-white p-2 m-4">
        {factor < 1.0 && (throttleSplats || throttleDpr) ? (
          <div className="text-red-500">
            Quality degraded to save FPS! You can disable this in settings.
          </div>
        ) : null}
        {factor < 0.5 && !throttleSplats && !throttleDpr ? (
          <div className="text-red-500">
            FPS degraded! You can enable quality tuning in settings.
          </div>
        ) : null}
        <div>Perf factor: {factor.toFixed(2)}</div>
        <div>Applied pixel ratio: {effectiveDpr.toFixed(2)}</div>
        <div>Applied splat count: {(effectiveSplats / 1e6).toFixed(2)}M</div>
      </div>
    </>
  );
};

export default CanvasLayer;
