# Hyperrealistic Indoor Street View

<p align="left">
  <strong>
    Exercise: getting familiar with the pipeline
  </strong>
</p>

https://github.com/cgtuebingen/hyperrealistic_indoor_streetview/assets/9963865/0a519b96-e1d7-40c6-86f7-8eb69c25e82e


# Overview
In order to create your own gaussian splat for the web, we have to go through some steps. That require setup on your local machine and the cluster from the university.


- [Installation](#installation)
  - [Local Setup](#local-setup)
  - [Server Setup](#server-setup)
- [Data Acquisition](#data-acquisition)
- [Preprocessing](#preprocessing)
- [Training](#training)
- [Application](#application)



# Installation
First, we need to setup our local and server environments. We will setup our local environment to run the web server and display the gaussian splat in our web browser. For the server setup we will use the cluster of computer graphics at the University of Tübingen. We will optimize the gaussian splats in the cluster and download the optimized splats to display them in our web browser.

<img width="1376" alt="Pipeline" src="https://github.com/cgtuebingen/hyperrealistic_indoor_streetview/assets/9963865/4cae9848-95b7-4f88-a42e-09e14cb501ba">

> This installtion process might be lengthy and require some time. However, it is important that every one of you once understands the full pipeline of the project. Help is always available in the discord channel. Help each other first and if no one can help, ask me.

## Local Setup
We need to prepare our local environment to run the web server and display the gaussian splat in our web browser. We will use [React](https://react.dev/) in combination with [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction) to do so. I will provide the full code for that, so you only have to setup your environment to allow the code to run.

> This tutorial is optimized for macOS and Linux. If you are using Windows, you might have to adjust some commands, I highly recommend using [WSL](https://docs.microsoft.com/en-us/windows/wsl/install) to run a Linux distribution on your Windows machine.

### Node.js and package managers
First we need to install [Node.js](https://nodejs.org/en/download). You can download the installer from the website or use a package manager like [brew](https://brew.sh/) on macOS. You can also install node over the node version manager [nvm](https://github.com/nvm-sh/nvm) to manage multiple node versions on your machine (recommended).

Check if you have installed node and npm by running the following commands in your terminal:
```bash
node -v
npm -v
```

Next, we need to install [yarn](https://yarnpkg.com/) as our package manager of choice (replacing nmp). You can install yarn with npm by running the following command:
```bash
npm install -g yarn
```
After that you can check if yarn is installed by running:
```bash
yarn -v
```

### Install the web application
Next, we need to clone the repository to our local machine. You can do so by running the following command in your terminal:
```bash
git clone git@github.com:cgtuebingen/hyperrealistic_indoor_streetview.git
```

After cloning the repository we need to install the dependencies for the web application. You can do so by running the following command in the root directory of the repository:
```bash
cd ./hyperrealistic_indoor_streetview
yarn install
```

If everything went well you can start the web server by running the following command in the root directory of the repository:
```bash
yarn dev
```

Goto `http://localhost:5173/` (might be different for you) in your web browser to see the web application running. You should see a first gaussian splatting scene I created for you.



## Server Setup
We will use the cluster of computer graphics at the University of Tübingen to train our gaussian splatting scene. On the server we will first setup our [python](https://www.anaconda.com/download) environment and then install [nerfstudio](https://docs.nerf.studio/) to train our gaussian splatting scene.

### Connecting to the cluster
We have a full tutorial and cheatsheet on how to connect to the cluster. As I cannot share it publicly, you will find the `ssh_and_vnc.pdf` in the web page linked in the Discord channel or email you received. Complete steps 1-4 (including 4) before continuing with the next steps.

> Important: Complete the steps 1-4 (including 4) before continuing with the next steps.

### Python environment
Next we will install miniconda to manage our python environment. Be sure that you connected to the cluster and are on one of the pool-machines (e.g. `cgpool1801,...,cgpool1803` or `cgpool1900,...,cgpool1915` or `cgpoolsand1900,...,cgpoolsand1907`).

These five commands quickly and quietly install the latest 64-bit version of the installer and then clean up after themselves (enter them one after the other):
```bash
cd ~
mkdir ~/miniconda
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
rm -rf ~/miniconda3/miniconda.sh
```
After installing, initialize your newly-installed Miniconda. The following commands initialize for bash and zsh shells:
```bash
~/miniconda3/bin/conda init bash
```

You can also add the path to your `.bashrc` file to automatically activate the conda environment when you open a new terminal.
```bash
cd ~
touch ~/.bashrc
echo "source ~/miniconda3/etc/profile.d/conda.sh" >> ~/.bashrc
source ~/.bashrc
```


### Nerfstudio
Next we will install [nerfstudio](https://docs.nerf.studio/) to train our gaussian splatting scene.

#### Create a new conda environment
```bash
conda create -n nerfstudio python=3.8
conda activate nerfstudio
python -m pip install --upgrade pip
```

#### Dependencies
We need to install some dependencies to run nerfstudio, like `torch`, `torchvision`, `functorch` and `tinycudann`. We will install `torch` and `torchvision` from the official pytorch website and `functorch` and `tinycudann` from the github repositories.
```bash
pip install torch==2.1.2+cu118 torchvision==0.16.2+cu118 --extra-index-url https://download.pytorch.org/whl/cu118
conda install -c "nvidia/label/cuda-11.8.0" cuda-toolkit
pip install ninja git+https://github.com/NVlabs/tiny-cuda-nn/#subdirectory=bindings/torch
```

#### Nerfstudio
Finally we can install nerfstudio and set it up with the following commands:
```bash
pip install nerfstudio
ns-install-cli
```

### COLMAP
We will use [COLMAP](https://colmap.github.io/) to preprocess the images for the training. We install COLMAP with the following commands:
```bash
conda install -c conda-forge colmap
```


# Data Acquisition
The first step is to get the data. In our case of inverse rendering we need images from a static scene. So as a first step scan your room with your mobile phone. Meaning you have to take a lot of pictures from different angles and positions.

- Check that the room is well lit and there are no moving objects.
- Take rouhgly 80-140 pictures of your room from different angles and positions.


# Preprocessing
In the next step we will preprocess the images to retreive camera poses and intrinsics for the images.We will use [COLMAP](https://colmap.github.io/) to do so. Neatly it is already installed on the cluster and can be interfaced with Nerfstudio.

#### Upload your images to the cluster
First, we need to upload the images to the cluster. You can use `scp` to upload the images to the cluster:

```bash
scp -r /path/to/your/images/ username@servername:/path/to/save/your/images/
```
Replace `/path/to/your/images/` with the path to your images on your local machine and `/path/to/save/your/images/` with the path to save your images on the cluster. Furthermore replace `username` with your username and `servername` with a viable servername (e.g. `cgcontact` or `cgpool1801,...,cgpool1803` or `cgpool1900,...,cgpool1915` or `cgpoolsand1900,...,cgpoolsand1907`).

> Alternatively if you are using visual studio code you can use the `Remote - SSH` extension to connect to the cluster and upload the images directly from the editor.

#### Preprocessing
Run the following command to preprocess the images with COLMAP:
```bash
 ns-process-data images --data /path/to/save/your/images/ --output-dir /new/path/to/processed/images/
```
Replace `/path/to/save/your/images/` with the path to your images on the cluster and `/new/path/to/processed/images/` with the path to save your processed images on the cluster.


# Training
Before starting the training be sure to be connected to the cluster and on one of the pool-machines (e.g. `cgpool1801,...,cgpool1803` or `cgpool1900,...,cgpool1915` or `cgpoolsand1900,...,cgpoolsand1907`). Before starting a training always check the available resources on the cluster with the following command:
```bash
pool-smi
```
If you are sure that no one is using the cluster you can start the training with the following command:
```bash
ns-train splatfacto --data /new/path/to/processed/images/ --output-dir ./outputs
```

> You can see the progress of the training in the terminal. If you want to stop the training press `ctrl + c`.

<img width="1493" alt="Nerfstudio Viewer" src="https://github.com/cgtuebingen/hyperrealistic_indoor_streetview/assets/9963865/39ad1ef7-49c9-43b2-8fb1-159b3037ee73">

> (Optional) You can also visualize the training progress by using the nerfstudio viewer. Create a port forwarding for the cluster and open the viewer in your web browser. Run this command on your local machine (not on the cluster) or use the VS Code port forwarding: 
> ```bash
> ssh -L 7007:127.0.0.1:7007  servername
> ```
> The viewer is available at `http://localhost:7007/` in your web browser. You may have to change the port to the one displayed in the terminal, when you started the training.


#### Export the optimized scene
After the training is finished you can export the optimized scene with the following command:
```bash
ns-export gaussian-splat --load-config outputs/...[experiment_path].../config.yml --output-dir ./exports/splat
```
Replace `[experiment_path]` with the path to the experiment folder in the `outputs` directory. You can find the path in the terminal output of the training.

# Application

After you trained the model successfully you can download the optimized scene to display them in your web browser.

#### Download the optimized scene
First, we need to download the optimized scene to our local machine. You can do so by running the following command in your terminal on your local machine:
```bash
scp -r username@servername:./exports/splat/splat.ply /.../hyperrealistic_indoor_streetview/
```
> Again if you are using visual studio code you can use the `Remote - SSH` extension to connect to the cluster and download the optimized scene directly from the editor.

#### Display the optimized scene
After downloading the optimized scene you can display the scene in your web browser. But before that, we need to convert our `splat.ply` file to a `scene.splat` file. Be sure to have the `splat.ply` file in the root directory of the repository. You can convert the `splat.ply` file to a `scene.splat` file by running the following command in the root directory of the repository:
```bash
node ./convert_ply_to_splat.js
```

Then the `splat.splat` file should be within the `public` folder of the web application. You can start the web server by running the following command in the root directory of the repository:
```bash
yarn dev
```

<img width="1456" alt="Bildschirmfoto 2024-04-25 um 11 23 47" src="https://github.com/cgtuebingen/hyperrealistic_indoor_streetview/assets/9963865/18208e63-a278-4b22-b92b-1b3b0b01bbfe">

Go to `http://localhost:5173/` (might be different for you) in your web browser to see the web application running. You should see the optimized gaussian splatting scene you trained on the cluster. Navigate with your mouse and zoom, see [here](https://github.com/pmndrs/drei?tab=readme-ov-file#controls) for full controls. 
