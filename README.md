# Ｖisual volume

## Introduction

Visual Volume is a project designed for visualizing volumetric data. This project leverages web technologies such as Three.js and WebGL to render and display three-dimensional volumetric data from sources like CT scans.

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
    pip install numpy torch tifffile scipy open3d opencv-python
    ```
3. Init the web project
    ```bash
    cd web
    npm install
    ```

## processing guideline

1. Data collection, download the dataset [PHercParis4.volpkg](https://dl.ash2txt.org/full-scrolls/Scroll1/PHercParis4.volpkg/volume_grids/20230205180739/)
2. Transform CT-scan into pt
    - ile format: tif->pt
    - location: `code/surface_detection.py`
3. Transform into nrrd
    - file format: pt->nrrd
    - location: `code/pt_nrrd.py`
4. Use web to show the result
    - file format: nrrd
    - location: `web/`

### processing detail

1. Data collection

    > note: you need to sign up, and then you can get the <userName> and <password>

    ```bash
    cd visual-volume
    ```

    ```bash
    wget --no-parent -r -nd --user=<userName> --password=<password> -P dataset https://dl.ash2txt.org/full-scrolls/Scroll1/PHercParis4.volpkg/volume_grids/20230205180739/cell_yxz_006_008_004.tif
    ```

2. CT-scan transform into pt

    ```bash
    python3 code/surface_detection.py dataset/cell_yxz_006_008_004.tif
    ```

3. Transform into nrrd
    ```bash
    visual-volume
    python3 code/pt_nrrd.py dataset/cell_yxz_006_008_004.tif
    ```
4. Use web to show the result
    ```bash
    cd /web
    npm run dev
    ```

## Reference

1. Github repo: [tomhsiao1260/pipeline-visualize](https://github.com/tomhsiao1260/pipeline-visualize)
2. Github repo: [ThaumatoAnakalyptor](https://github.com/schillij95/ThaumatoAnakalyptor)
