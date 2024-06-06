# Vesuvius Challenge 3D visualization
> 1122 台大計算機圖形 期末專案

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
1. [Vesuvius Challenge](https://scrollprize.org/)
```
wget --no-parent -r --user=<user name> --password=<password> https://dl.ash2txt.org/full-scrolls/Scroll1/PHercParis4.volpkg/volume_grids/20230205180739/cell_yxz_006_008_004.tif

```

```
python3 surface_detection.py cell_yxz_001_001_002.tif
```
## Tech
> WEBGL, Three.js, visualization
1. [Three.js](https://threejs.org/)
2. github repo:  [ThaumatoAnakalyptor](https://github.com/schillij95/ThaumatoAnakalyptor)

## Steps
1. clone this repo
    ```bash=
    git clone https://github.com/pocper1/visual-volume.git
    cd Web
    ```
2. install dependency, `npm install`
3. Download datasets from Vesuvius Challenge, and put into Dataset
4. build up, `npm run dev`

## notes
1. transform_obj from origin.tif to origin.obj


## Reference
1. [Volume Shader](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/shaders/VolumeShader.js)
2. Github repo: [tomhsiao1260/pipeline-visualize](https://github.com/tomhsiao1260/pipeline-visualize)
3. Github repo: [tomhsiao1260/vc-cell](https://github.com/tomhsiao1260/vc-cell)
