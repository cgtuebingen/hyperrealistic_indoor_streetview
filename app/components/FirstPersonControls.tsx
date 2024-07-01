import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { sqrt } from 'three/examples/jsm/nodes/Nodes.js';

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
  const cameraHeight = 3;

  
  // temporary location for arrow graphs, TODO: move this outside of the controller  
  type edge = {
    arrow1: THREE.Object3D;
    arrow2: THREE.Object3D;
    weight: number;
  }

  type arrowgraph = {
    arrows: THREE.Object3D[];
    edges: edge[];
  }

  type pathDraft = {
    pathWeight: number;
    pathArrows: THREE.Object3D[];
  }
  
  class ArrowGraph {
    private graph: arrowgraph;
    private arrowsShortestPaths: (THREE.Object3D|undefined)[][];
    private scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
      this.graph = { arrows: [], edges: [] };
      this.arrowsShortestPaths = [];
      this.scene = scene;
    }
  
    addArrow(arrow: THREE.Object3D): void{
      this.graph.arrows.push(arrow);
    }
  
    addEdge(arrow1name: string, arrow2name: string): void {
      const arrow1 = this.scene.getObjectByName(arrow1name);
      const arrow2 = this.scene.getObjectByName(arrow2name);
      if(arrow1 && arrow2){
        const weight: number = Math.sqrt(
          Math.pow(arrow1.position.x - arrow2.position.x, 2) +
          Math.pow(arrow1.position.y - arrow2.position.y, 2)
        );
        const newEdge: edge = { arrow1, arrow2, weight };
        this.graph.edges.push(newEdge);
      }
    }

    public findShortestPaths(): void {
      const arrowCount = this.graph.arrows.length;
      this.arrowsShortestPaths = Array.from({ length: arrowCount }, () =>
        Array(arrowCount).fill(undefined)
      );

      this.graph.arrows.forEach((startArrow, startIndex) => {
        const distance = new Map<THREE.Object3D, number>();
        const previous = new Map<THREE.Object3D, THREE.Object3D | undefined>();
        const remaining = new Set<THREE.Object3D>();

        this.graph.arrows.forEach(arrow => {
          distance.set(arrow, Infinity);
          previous.set(arrow, undefined);
          remaining.add(arrow);
        });

        distance.set(startArrow, 0);

        while (remaining.size > 0) {
          let currentArrow: THREE.Object3D | undefined = undefined;
          let minDistance = Infinity;

          remaining.forEach(arrow => {
            const dist = distance.get(arrow)!;
            if (dist < minDistance) {
              minDistance = dist;
              currentArrow = arrow;
            }
          });

          if (currentArrow === undefined) break;
          remaining.delete(currentArrow);

          this.graph.edges.forEach(edge => {
            let neighbor: THREE.Object3D | undefined = undefined;
            if (edge.arrow1.name == currentArrow.name) {
              neighbor = edge.arrow2;
            } else if (edge.arrow2.name == currentArrow.name) {
              neighbor = edge.arrow1;
            }

            if (neighbor) {
              remaining.forEach(arrow => {
                if (arrow.name == neighbor.name) {
                  const alt = distance.get(currentArrow) + edge.weight;
                  for (let [key, value] of distance) {
                    if (key.name == neighbor.name) {
                      if (alt < value) {
                        distance.delete(key);
                        distance.set(neighbor, alt);
                        previous.delete(key);
                        previous.set(neighbor, currentArrow);
                      }
                    }
                  }
                }
              })
            }
          });
        }

        this.graph.arrows.forEach((endArrow, endIndex) => {
          if (startArrow !== endArrow) {
            for (let [nextArrow, value] of previous){
              if (nextArrow.name == endArrow.name){
                while (nextArrow !== undefined && previous.get(nextArrow) !== startArrow) {
                  nextArrow = previous.get(nextArrow);
                }
                this.arrowsShortestPaths[startIndex][endIndex] = nextArrow;
              }
            }
          }
        });
      });
    }

    updateArrowRotations(destinationArrowName: string): void {
      const destinationArrow = this.scene.getObjectByName(destinationArrowName);
      if (destinationArrow !== undefined) {
        const destinationArrowIndex = this.graph.arrows.findIndex(obj => obj.name == destinationArrow.name);
        if (this.arrowsShortestPaths.length === 0) {
          console.log("initial arrow setup");
          this.findShortestPaths();
        }
        console.log(this.arrowsShortestPaths);
        for (let arrowIndex = 0; arrowIndex < this.graph.arrows.length; arrowIndex++) {
          let arrow = this.graph.arrows[arrowIndex];
          let arrowDestination = this.arrowsShortestPaths[arrowIndex][destinationArrowIndex];
          if (arrow != undefined) {
            if (arrowDestination != undefined) {
              arrow.visible = true;
              let vectorToNextArrow = [arrow.position.x - arrowDestination.position.x,
              arrow.position.z - arrowDestination.position.z];
              arrow.rotation.y = -Math.atan2(vectorToNextArrow[1], vectorToNextArrow[0]);
            } 
          } else {
            arrow.visible = false;
          }
        }
      }
    }
  }

  const graph = new ArrowGraph(scene);


  // temporary location for rooms, TODO: move this outside of the controller
  const rooms = [
    {
      minX: -50, maxX: 50, minY: 0, maxY: 20, minZ: -50, maxZ: 50,
      slopes: [
        { angle: Math.PI / 3 , position: { x: 0, y: 0, z: 0 }, width: 10 },
        { angle: Math.PI / 3, position: { x: 10, y: 0, z: 0 }, width: 10 }
      ],
      elements: {
        arrows: [
          {position: { x: 20, y: -10, z: 20}, horizontalRotation: Math.PI, graphName: "Pfeil0"},
          {position: { x: 40, y: -10, z: 10}, horizontalRotation: Math.PI, graphName: "Pfeil1"},
          {position: { x: 0, y: -10, z: 0}, horizontalRotation: Math.PI, graphName: "Pfeil2"},
          {position: { x: -10, y: -10, z: 40}, horizontalRotation: Math.PI, graphName: "Pfeil3"},
          {position: { x: 20, y: -10, z: 60}, horizontalRotation: Math.PI, graphName: "Pfeil4"}
        ],
        panes: [
          { position: { x: 0, y: 0, z: 0}, verticalRotation: Math.PI / 6, horizontalRotation: Math.PI/4, sizefactor: 10, content: "/images/testbild.png"},
        ],
        windowarcs: [
          { position: { x: 0, y: 0, z: 0}, horizontalRotation: 0, arcRadius: 10, arcHeight: 30, content: "/images/testbild.png"}
        ]
      }
    },
    {
      minX: 50, maxX: 60, minY: 0, maxY: 10, minZ: 0, maxZ: 10,
      slopes: [],
      elements: {
        arrows: [],
        panes: [],
        windowarcs: []
      }
    },
    {
      minX: 60, maxX: 160, minY: 0, maxY: 20, minZ: -50, maxZ: 50,
      slopes: [],
      elements: {
        arrows: [],
        panes: [],
        windowarcs: []
      }
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

    const textureLoader = new THREE.TextureLoader();
    const gltfloader = new GLTFLoader();

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

      // Add slopes to the scene
      room.slopes.forEach((slope, index) => {
        const slopeGeometry = new THREE.PlaneGeometry(slope.width, 100);
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
        slopeMesh.name = `slope-${room.minX}-${room.maxX}-${room.minZ}-${room.maxZ}-${index}`; // Naming slopes to easily find them later
        scene.add(slopeMesh);
      });

      // Add (interactable) elements to the scene
      room.elements.panes.forEach((pane, index) => {
        textureLoader.load(pane.content, (texture) => {
          const aspectRatio = texture.image.width / texture.image.height;
          const paneHeight = pane.sizefactor; // or any desired height
          const paneWidth = paneHeight * aspectRatio;

          const paneGeometry = new THREE.PlaneGeometry(paneWidth, paneHeight);
          const paneMaterial = new THREE.MeshBasicMaterial({ map: texture });
          const paneMesh = new THREE.Mesh(paneGeometry, paneMaterial);
          paneMesh.rotation.set(-pane.verticalRotation, pane.horizontalRotation, 0, 'YXZ');
          paneMesh.position.set(
            room.minX + (room.maxX - room.minX) / 2 + pane.position.x,
            (room.minY + room.maxY) / 2 + pane.position.y,
            room.minZ + (room.maxZ - room.minZ) / 2 + pane.position.z
          );
          paneMesh.name = `pane-${room.minX}-${room.maxX}-${room.minZ}-${room.maxZ}-${index}`; // Naming panes to easily find them later
          scene.add(paneMesh);
        });
      });

      room.elements.windowarcs.forEach((arc, index) => {
        const texture = textureLoader.load(arc.content);
        const arcGeometry = new THREE.CylinderGeometry(arc.arcRadius, arc.arcRadius, arc.arcHeight, 16, 1, true, 0, Math.PI);
        const arcMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide});
        const arcMesh = new THREE.Mesh(arcGeometry, arcMaterial);
        arcMesh.rotation.y = arc.horizontalRotation;
        arcMesh.position.set(
          room.minX + (room.maxX - room.minX) / 2 + arc.position.x,
          (room.minY + room.maxY) / 2 + arc.position.y,
          room.minZ + (room.maxZ - room.minZ) / 2 + arc.position.z
        );
        arcMesh.name = `arc-${room.minX}-${room.maxX}-${room.minZ}-${room.maxZ}-${index}`; // Naming panes to easily find them later
        scene.add(arcMesh);
      });


      room.elements.arrows.forEach((arrow, index) => {
        const mesh = gltfloader.load("/meshes/arrow.glb", function (gltf){
          const arrowMesh = gltf.scene;
          const whiteTexture = new THREE.MeshBasicMaterial({ color: 0xffffff });
          arrowMesh.rotation.y = 0;
          arrowMesh.position.set(
            room.minX + (room.maxX - room.minX) / 2 + arrow.position.x,
            (room.minY + room.maxY) / 2 + arrow.position.y,
            room.minZ + (room.maxZ - room.minZ) / 2 + arrow.position.z
          );
          const modelscale = 1;
          arrowMesh.scale.set(modelscale, modelscale, modelscale);
          arrowMesh.visible = false;
          arrowMesh.name = arrow.graphName; // Naming panes to easily find them later
          graph.addArrow(arrowMesh);
          scene.add(arrowMesh);
        }, undefined, function (error) {
          console.error('An error happened', error);
        });
      })
    });

    //temporary location of Edges, TODO: move them to a better place when refractoring
    graph.addEdge("Pfeil0", "Pfeil1");
    graph.addEdge("Pfeil1", "Pfeil2");
    graph.addEdge("Pfeil0", "Pfeil2");
    graph.addEdge("Pfeil2", "Pfeil3");
    graph.addEdge("Pfeil3", "Pfeil4");

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

    const newPosition = camera.position.clone().addScaledVector(velocity, delta);

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

    // detect if user is going into another room
    if (currentRoom && nextRoom && currentRoom !== nextRoom) {
      currentRoom = nextRoom;
      graph.updateArrowRotations("Pfeil4");
    }

    if (currentRoom) {
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
