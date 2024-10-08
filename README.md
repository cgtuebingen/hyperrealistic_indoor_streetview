# Hyperrealistic Indoor Streetview
https://github.com/user-attachments/assets/cbde01e2-ca74-455a-9ea1-d33eb5a8ab1a

## Overview
**Hyperrealistic Indoor Streetview** is a project that brings high-fidelity, photorealistic 3D reconstructions of indoor environments to the web. This project utilizes state-of-the-art techniques such as Gaussian Splatting and Neural Radiance Fields (NeRFs) to create a dynamic and interactive experience of indoor scenes, directly accessible via web browsers.

The pipeline includes several steps such as data acquisition, preprocessing, training, and rendering, and leverages powerful computing clusters for optimizing the scene data. The final result can be explored interactively, offering a smooth and immersive user experience.

### Key Features
- **Photorealistic 3D reconstructions**: Leveraging NeRF and Gaussian Splatting techniques.
- **Interactive Web Viewing**: Real-time exploration of indoor environments in web browsers using React.
- **Performance Improvements**: Over other solutions through culling and unloading of splats. 
- **Navigation Through Buildings**: Display arrows that lead you to your destination.

---

## Getting Started
### Via Docker
- Install [Docker](https://www.docker.com/) (Required!)
**If you want to use your own splats**
- Download the [docker-compose.yml](https://github.com/cgtuebingen/hyperrealistic_indoor_streetview/blob/e70b5098cc485d6f7ac06f7e6e20f7c50f8afe00/docker-compose.yml)
- Create a directory called `public` in the same directory as the [docker-compose.yml](https://github.com/cgtuebingen/hyperrealistic_indoor_streetview/blob/e70b5098cc485d6f7ac06f7e6e20f7c50f8afe00/docker-compose.yml)
- Place any splats you want to use inside the public folder
- run `docker compose up` in the terminal with the working directory set to the directory you saved the [docker-compose.yml](https://github.com/cgtuebingen/hyperrealistic_indoor_streetview/blob/e70b5098cc485d6f7ac06f7e6e20f7c50f8afe00/docker-compose.yml)
**If you just want to try the web-viewer**
- `docker image pull fabiuni/teamprojekt` Download the image
- `docker run -dp:3000:3000 fabiuni/teamprojekt` Run the image

### Via GitHub
**Requirements:** [Node](https://nodejs.org/en) and yarn (install via `npm install -g yarn`)
- Clone the code from [GitHub](https://github.com/cgtuebingen/hyperrealistic_indoor_streetview): `git clone git@github.com:cgtuebingen/hyperrealistic_indoor_streetview.git`
- Run `yarn dev` in the terminal in the root directory of the project (should be hyperrealistic_indoor_streetview)

---

## Features
For additional information feel free to visit our [Wiki](https://github.com/cgtuebingen/hyperrealistic_indoor_streetview/wiki).

**Teleportation**\
The teleportation feature offers the possibility to let the user teleport to points of interest in the scene with a click of a button. 
It introduces the `handleTeleport()` function in `CanvasLayer.tsx` which is used to teleport the User to a location defined inside the function. It uses the `teleport(x: number, y: number, z: number, lookAtX: number, lookAtY: number, lookAtZ: number)` which is defined in teleportControls.tsx and handles the actual logic behind the teleportation.

**Minimap**\
*In Progress*

**Rendering Changes and Additions**\
The Web-Viewer now supports room based rendering, meaning multiple splats can be used, loaded and unloaded depending on where the user is in the scene. You can define rooms as an object in the roomConfig array following this pattern: 
```
const roomConfig = [
      {
        splat: "../../public/Splat.splat",
        name: "room1",
        adjacent: [],
        minX: -100, maxX: 100, minY: 0, maxY: 5, minZ: -100, maxZ: 100,
        slopes: [],
        objects: [],
        elements: {
          arrows: [],
          panes: [],
          windowarcs: []
        }
      }
  ];
```
This allows for dynamic loading and undloading of the nearest rooms which greatly improves the performance:
https://github.com/user-attachments/assets/748d0ef7-815c-4ffe-a272-c56ff2348712



https://github.com/user-attachments/assets/2900fa7e-f75e-46a6-a6c3-951e27efa664





Also introduced were slopes, objects and elements like panes and windowarcs. To add a pane simply push it into the pane array via `roomConfig[n].elements.panes.push(pane1)`.<br>
<img src="https://github.com/user-attachments/assets/1fee5b88-8e93-4ca1-a03a-6cb8a426fae3" alt="image" width="472"/>
<img src="https://github.com/user-attachments/assets/a167d706-9df2-49a4-9f5e-be80590bd40e" alt="image" width="300"/>

To make a pane which holds a picture create an object with the following pattern:
```
{position: xyz-coordinates, verticalRotation: number, horizontalRotation: number, sizeFactor: number, content: content}


```
As everything outside windows most of the time isn't splatted properly we added "windowarcs", which act as a replacement of the splats behind the windows with a picture.  
Windowarcs work similarly to panes with the required attributes being
```
{position: xyz-coordinates, horizontalRotation: number, arcRadius: number, arcHeight: number, content: content}
```
![image](https://github.com/user-attachments/assets/d156e733-4cc1-4cbf-b642-f7b9c4fb560e)

Arrrows were added to support guiding the user through splats. Arrows follow the pattern:
```
{position: xyz-coordinates, graphName: string}   
```
To connect the single arrows in an arrowGraph you need to add the edges to an ArrowGraph. You create an ArrowGraph with the new ArrowGraph constructor like this:
```
const graph = new ArrowGraph(scene: THREE.Scene);
```
It has three attributes:
```
graph: arrowgraph \\ Holds edges and arrows
arrowsShortestPaths: (THREE.Object3D|undefined)[][] \\Holds the shortest paths between the arrows
scene: THREE.Scene \\ Holds the THREE Scene
```
Methods are:
- `addArrow(arrow: THREE.Object3D): void` 
Adds a THREE.Object3D to the graph which serves as the arrows model in the 3D-Viewer
- `addEdge(arrow1name: string, arrow2name: string): void` 
Adds edges between the arrows (at this point it is necessary to connect the arrows manually). The arrowNames 
- `findShortestPaths(): void` 
Finds the shortest paths between all arrows and saves them in arrowsShortestPaths
- `updateArrowRotations(destinationArrowName: string): void`
Updates the rotations of all arrows so they point towards the target arrow along the shortest path to it. 

Now simply add the edges of the arrowgraph to the graph via `arrowGraph.addGraph(arrow)`. 
An example for adding arrows is below:
```
// Declare arrowGraph
const arrowGraph = new ArrowGraph(scene);

// Add arrows to room
roomConfig[1].elements.arrows[0] = {xyzCoordinates, arrowGraph};
roomConfig[1].elements.arrows[1] = {xyzCoordinates, arrowGraph};

// Add edges to the graph
arrowGraph.addEdge("arrowOneName", "arrowTwoName"); // the arrow names are the names the arrows have in the scene, so you
// need know these names before entering them

```
https://github.com/user-attachments/assets/a3f4523d-f2e1-4514-aac0-26c259e4ef9a



**3D Bounding Boxes**\
There are now 3D Bounding Boxes which limit the space the user can move to. These can be moved to reflect the internal structure of a splat. 

**Interactive Elements**\
Interactive 3D Elements were added to help the user interact with the scene. As the feature is in active developement it will be documented in the future

**Improved User Controls**\
User Controls were changed to feel more like conventional controls in a First-Person Games (WASD-Control-Scheme). Camera height is now constant. Below is an overwiew of the important functions.
`FirstPersonControls ({ speed, rooms, updateCurrentRoom }): null` is the function that defines user controls and can be imported under the same name. Below the parameters are explained:
```
\\ speed is an object
speed: {value: number, min: number, max: number, step: number}

\\ rooms is an array of rooms (see the roomConfig[] array above for an example)
rooms: array[room]

\\ updateCurrentRoom is a function that handles the change from the current room to a new one (for an example of
\\ implementation see updateCurrentRoom in CanvasLayer.tsx)
updateCurrentRoom(newRoom: room): void

```
The control-scheme can easily be extended by adding keys inside the switch cases in onKeyDown and onKeyUp. Make sure to add it in both to be able to stop moving.

**Performance Improvements**\
Performance was improved on low-end machines via small optimization with about 5-10fps gained. 

---

## Example for Inspiration for your own projects
This is the project the codes was written for and may serve as an example for what you can do with this (and maybe what not).

**Outline**\
A small community center was mapped from the inside via Gaussian Splatting with bounding boxes added to mimick the architecture of the building. The goal was to be able to move inside the building like inside a video game.

The project was deployed on a server via GitHub. To keep the project updated GitHub Actions was used to automatically pull merges and pushes to main on to the server and restarting it. 

**GitHub Actions**\
GitHub Actions was used to automatically deploy updates to the server. Uses shimataro/ssh-key-action@v2 to ssh onto the server and automatically reinstall Node and Yarn to then pull the new version from GitHub and then restart the server. 

**Splat Creation**\
*!Please note that the method described here is probably outdated and you should do your own research on how to create splats!*
To create splats Nerfstudios [Splatfacto](https://docs.nerf.studio/nerfology/methods/splat.html) was used. Splatfacto relies on [Colmap](https://colmap.github.io/) and [FFmpeg](https://www.ffmpeg.org/), so make sure you have these installed when using Splatfacto.
Colmap is difficult to work with, so make sure to only feed it clear, unshaky images taken from very even angles. For further install instructions consult the respective websites.

**Splat Cleanup**\
The splats were cleaned up using [Supersplat]() and [Blender](https://www.blender.org/) with the [Gaussian-Splatting](https://github.com/ReshotAI/gaussian-splatting-blender-addon) addon to load the files. Blender was used as a work-around to be able to edit and move point-clouds while Supersplat is a lightweight web-editor and viewer for splats that makes it easy to edit splats by removing gaussians and reorienting the splat. 

**Landing Page**\
A landing page was created to integrate the viewer into a larger context and offer information on the project.

---

## About
This project was created by a team of eight bachelor students under the tutorship of [Jan-Niklas Dihlmann](https://github.com/JDihlmann) at the University of Tübingen in one semester. We learned a lot in this project and hope you enjoy it. If you find any bugs, issues or otherwise want to give feedback feel free to open an issue!

---

## License
This project is licensed under the MIT License, which allows for free use, modification, and distribution of the code. You are free to use this software in both personal and commercial projects as long as you include the original copyright notice. Please refer to the [LICENSE](LICENSE.md) file for more details.


This software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.


> **Disclaimer**: 
> Any work including gaussian-splatting may falls under their respective [LICENSE](https://github.com/graphdeco-inria/gaussian-splatting/blob/main/LICENSE.md)
---

