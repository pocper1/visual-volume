# Ｖisual volume

以下是一個簡單的 README 範本，根據你的 repo 生成的：

Visual Volume

Visual Volume 是一個用於視覺化體積數據的項目。本項目利用 Web 技術（如 Three.js 和 WebGL）來渲染和展示來自 CT 掃描或其他來源的三維體積數據。

功能

	•	加載和解析 VTK 和 NRRD 文件
	•	進行體積數據的渲染和顯示
	•	支持多種視覺化模式，如等值面和體繪製
	•	交互功能，允許用戶調整視角和視覺參數

安裝

	1.	克隆這個 repo：
    
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
