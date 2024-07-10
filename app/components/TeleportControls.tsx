import React, { useImperativeHandle, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

export const TeleportControls = React.forwardRef((props, ref) => {
  const { camera } = useThree();
  const [teleportData, setTeleportData] = useState<{
    position: THREE.Vector3;
    lookAt: THREE.Vector3;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    teleport: (x, y, z, lookAtX, lookAtY, lookAtZ) => {
      const position = new THREE.Vector3(x, y, z);
      const lookAt = new THREE.Vector3(lookAtX, lookAtY, lookAtZ);
      setTeleportData({ position, lookAt });
    }
  }));

  useFrame(() => {
    if (teleportData) {
      camera.position.copy(teleportData.position);
      camera.lookAt(teleportData.lookAt);
      setTeleportData(null);
    }
  });

  return null;
});

export default TeleportControls;
