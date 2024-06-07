# Ｖ isual volume

<p align="center">
    <img src="demo/visual-volume-demo.gif" alt="demo">
</p>

## Introduction

Visual Volume is a project designed for visualizing volumetric data. This project leverages web technologies such as Three.js and WebGL to render and display three-dimensional volumetric data from sources like CT scans.

### Purpose

The purpose of this project is to visualize the CT scan data of the [ThaumatoAnakalyptor](https://github.com/schillij95/ThaumatoAnakalyptor) project into a point cloud. Through this tool, we aim to improve the accuracy of data conversion.

This project is an extension based on the GitHub repository: [tomhsiao1260/pipeline-visualize](https://github.com/tomhsiao1260/pipeline-visualize).

### Features

-   Load and parse VTK and NRRD files
-   Render and display volumetric data
-   Support for various visualization modes such as isosurfaces and volume rendering
-   Interactive features allowing users to adjust the view and visualization parameters

### Dataset

The dataset source is from [PHercParis4.volpkg](https://dl.ash2txt.org/full-scrolls/Scroll1/PHercParis4.volpkg/volume_grids/20230205180739/). You need to sign up to access and use the dataset.

### Tech stack

-   three.js
-   python

## Setup

1. Clone this repo
    ```bash
    git clone https://github.com/pocper1/visual-volume.git
    ```
2. Install the dependency
    ```bash
    pip install numpy torch tifffile scipy open3d opencv-python pynrrd tqdm
    ```
3. Init the web project
    ```bash
    cd web
    npm install
    ```

## processing guideline

1. Data collection, download the dataset [PHercParis4.volpkg](https://dl.ash2txt.org/full-scrolls/Scroll1/PHercParis4.volpkg/volume_grids/20230205180739/)
2. Transform CT-scan into pt
    - file format: tif->pt
    - location: `code/surface_detection.py`
3. Transform into nrrd
    - file format: pt->nrrd
    - location: `code/pt_nrrd.py`
4. Use web to show the result
    - location: `web/`

### processing detail

1. Data collection
   Note: You need to sign up for the [Vesuvius Challenge Data Agreement](https://docs.google.com/forms/d/e/1FAIpQLSf2lCOCwnO1xo0bc1QdlL0a034Uoe7zyjYBY2k33ZHslHE38Q/viewform). Once registered, you will be granted a username and password to access the dataset.

    ```bash
    cd visual-volume
    ```

    ```bash
    wget --no-parent -r -nd --user=<userName> --password=<password> -P dataset https://dl.ash2txt.org/full-scrolls/Scroll1/PHercParis4.volpkg/volume_grids/20230205180739/cell_yxz_006_008_004.tif
    ```

2. CT-scan transform into pt
   write data into `/dataset/<tifName>/*`

    ```bash
    python code/surface_detection.py dataset/cell_yxz_006_008_004.tif
    ```

3. Transform into nrrd
   read data from `/dataset/<tifName>/*`, write data into `/web/public/<tifName>/*`
    ```bash
    python code/pt_nrrd.py
    ```
4. Use web to show the result
    ```bash
    cd /web
    npm run dev
    ```

### file structure

```
.
├── code
│   ├── nrrd_tools.py
│   ├── pt_nrrd.py
│   ├── surface_detection.py
│   └── umbilicus.txt
├── dataset
├── README.md
├── umbilicus.txt
└── web
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── public
    │   ├── cell_yxz_006_008_004
    │   │   ├── adjusted_vectors_interp.nrrd
    │   │   ├── adjusted_vectors.nrrd
    │   │   ├── blurred_volume.nrrd
    │   │   ├── first_derivative.nrrd
    │   │   ├── mask_recto.nrrd
    │   │   ├── mask_verso.nrrd
    │   │   ├── origin.nrrd
    │   │   ├── second_derivative.nrrd
    │   │   ├── sobel_vectors.nrrd
    │   │   ├── sobel_vectors_subsampled.nrrd
    │   │   └── vector_conv.nrrd
    ├── src
    │   ├── css
    │   │   └── main.css
    │   ├── img
    │   │   └── favicon.ico
    │   └── js
    │       ├── config.js
    │       ├── core
    │       │   ├── shaders
    │       │   │   ├── fragmentShader.glsl
    │       │   │   └── vertexShader.glsl
    │       │   ├── textures
    │       │   │   └── cm_viridis.png
    │       │   ├── ViewerCore.js
    │       │   └── VolumeMaterial.js
    │       ├── main.js
    │       └── volume.js
    └── vite.config.js
```
