# Documentation
## Overview

## Table of Contents

## Installation

### Via Docker
- Install [Docker](https://www.docker.com/) (Required!)
- Download the [docker-compose.yml](https://github.com/cgtuebingen/hyperrealistic_indoor_streetview/blob/e70b5098cc485d6f7ac06f7e6e20f7c50f8afe00/docker-compose.yml)
- Create a directory called `public` in the same directory as the [docker-compose.yml](https://github.com/cgtuebingen/hyperrealistic_indoor_streetview/blob/e70b5098cc485d6f7ac06f7e6e20f7c50f8afe00/docker-compose.yml)
- Place any splats you want to use inside the public folder
- run `docker compose up` in the terminal with the working directory set to the directory you saved the [docker-compose.yml](https://github.com/cgtuebingen/hyperrealistic_indoor_streetview/blob/e70b5098cc485d6f7ac06f7e6e20f7c50f8afe00/docker-compose.yml)

### Via GitHub
**Requirements:** [Node](https://nodejs.org/en) and yarn (install via `npm install -g yarn`)
- Pull the code from [GitHub](https://github.com/cgtuebingen/hyperrealistic_indoor_streetview): `git clone git@github.com:cgtuebingen/hyperrealistic_indoor_streetview.git`
- Run `yarn dev` in the terminal in the root directory of the project (should be hyperrealistic_indoor_streetview) 



## Features

**Teleportation**
The teleportation features offer the possibility to let the user teleport to points of interest in the scene with a click of a button. 
It introduces the `handleTeleport()` function in `CanvasLayer.tsx` which is used to teleport the User to a location defined inside the function. 


**Minimap**
*In Progress*

**Rendering Changes**
The Web-Viewer now supports room based rendering, meaning multiple splats can be used and loaded depending on where the user is in the scene. You can define rooms as an object following this pattern: 
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


**3D Bounding Boxes**
There are now 3D Bounding Boxes which limit the space the user can move to. These can be moved to reflect the internal structure of a splat. 

**Arrows**

**Interactive Elements**
Interactive 3D Elements were added to help the user 

**Improved User Controls**
User Controls were changed to feel more like conventional controls in a First-Person Games (WASD-Control-Scheme). Camera height is constant.


**Performance Improvements**
Performance was improved on low-end machines via small optimization with about 5-10fps gained. 


## Example for Inspiration for your own projects
**Outline**
A small community center was mapped from the inside via Gaussian Splatting with bounding boxes added to mimick the architecture of the building. The goal was to be able to move inside the building like inside a video game.

The project was deployed on a server via GitHub. To keep the project updated GitHub Actions was used to automatically pull merges and pushes to main on to the server and restarting it. 

**GitHub Actions**
GitHub Actions was used to automatically deploy updates to the server. Uses shimataro/ssh-key-action@v2 to ssh onto the server and automatically reinstall Node and Yarn to then pull the new version from GitHub and then restart the server. 

**Splat Creation**
*!Please note that the method described here is probably outdated and you should do your own research on how to create splats!*
To create splats Nerfstudios [Splatfacto](https://docs.nerf.studio/nerfology/methods/splat.html) was used. Splatfacto relies on [Colmap](https://colmap.github.io/) and [FFmpeg](https://www.ffmpeg.org/), so make sure you have these installed when using Splatfacto.
Colmap is difficult to work with, so make sure to only feed it clear, unshaky images taken from very even angles. For further install instructions consult the respective websites.

**Splat Cleanup**
The splats where cleaned up using [Supersplat]() and [Blender](https://www.blender.org/) with the [Gaussian-Splatting](https://github.com/ReshotAI/gaussian-splatting-blender-addon) addon to load the files. Blender was used as a work-around to be able to edit and move point-clouds while Supersplat is a lightweight web-editor and viewer for splats that makes it easy to edit splats by removing gaussians and reorienting the splat. 

**Landing Page**
A landing page was created to integrate the viewer into a larger context and offer information on the project.

