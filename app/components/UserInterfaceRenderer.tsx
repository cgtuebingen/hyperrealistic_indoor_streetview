import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const UserInterfaceRenderer = ({rooms}) => {
  const { camera, scene } = useThree();

  type edge = {
    arrow1: THREE.Object3D;
    arrow2: THREE.Object3D;
    weight: number;
  }

  type arrowgraph = {
    arrows: THREE.Object3D[];
    edges: edge[];
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
        const previous = new Map<THREE.Object3D, THREE.Object3D[]>();
        const remaining = new Set<THREE.Object3D>();

        this.graph.arrows.forEach(arrow => {
          distance.set(arrow, Infinity);
          previous.set(arrow, []);
          remaining.add(arrow);
        });

        distance.set(startArrow, 0);

        while (remaining.size > 0) {
          let currentArrow: THREE.Object3D | undefined = undefined;
          let minDistance = Infinity;

          remaining.forEach(arrow => {
            for (let [key, value] of distance) {
              if (key.name == arrow.name) {
                if (value < minDistance) {
                  minDistance = value;
                  currentArrow = arrow;
                }
              }
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
                  let distanceCurrentArrow = Infinity;
                  for (let [key, value] of distance) {
                    if (key.name == currentArrow.name){
                      distanceCurrentArrow = value;
                    }
                  }
                  for (let [key, value] of distance) {
                    if (key.name == neighbor.name) {
                      const alt = distanceCurrentArrow + edge.weight;
                      if (alt < value) {
                        distance.delete(key);
                        distance.set(neighbor, alt);
                        previous.delete(key);
                        let currentArrowPrevious;
                        for (let [key, value] of previous) {
                          if (key.name == currentArrow.name){
                            currentArrowPrevious = value;
                          }
                        }
                        previous.set(neighbor, [...currentArrowPrevious]);
                        previous.get(neighbor).push(currentArrow);
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
                value.push(endArrow);
                nextArrow = value[1];
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
          this.findShortestPaths();
        }
        for (let arrowIndex = 0; arrowIndex < this.graph.arrows.length; arrowIndex++) {
          let arrow = this.graph.arrows[arrowIndex];
          let arrowDestination = this.arrowsShortestPaths[arrowIndex][destinationArrowIndex];
          if (arrow != undefined) {
            if (arrowDestination != undefined) {
              arrow.visible = true;
              let vectorToNextArrow = [arrow.position.x - arrowDestination.position.x,
              arrow.position.z - arrowDestination.position.z];
              arrow.rotation.y = -Math.atan2(vectorToNextArrow[1], vectorToNextArrow[0]);
            } else {
              arrow.visible = false;
            }
          }
        }
      }
    }
  }

  const graph = new ArrowGraph(scene);


  // for debugging purposes
  useEffect(() => {
    const onKeyDown = (event) => {
      switch (event.code) {
        case 'KeyP':
            console.log("p")
            break;
      }
    };


    window.addEventListener('keydown', onKeyDown);

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
          const modelscale = 2;
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
    graph.addEdge("P0", "P1");
    graph.addEdge("P1", "P2");
    graph.addEdge("P1", "P3");
    graph.addEdge("P2", "P3");
    graph.addEdge("P2", "P5");
    graph.addEdge("P3", "P4");
    graph.addEdge("P4", "P5");

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [rooms, scene]);

  return null;
};
