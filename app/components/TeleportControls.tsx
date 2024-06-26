// TeleportControls.tsx
import React, { useImperativeHandle, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

const TeleportControls = React.forwardRef((props, ref) => {
  const { camera } = useThree();
  const [teleportPosition, setTeleportPosition] = useState<THREE.Vector3 | null>(null);

  useImperativeHandle(ref, () => ({
    teleport: (x, y, z) => {
      setTeleportPosition(new THREE.Vector3(x, y, z));
    }
  }));

  useFrame(() => {
    if (teleportPosition) {
      camera.position.copy(teleportPosition);
      setTeleportPosition(null);
    }
  });

  return null;
});

export default TeleportControls;