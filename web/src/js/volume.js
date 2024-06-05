import * as THREE from "three";
import ViewerCore from "./core/ViewerCore";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";

const input_files = ["origin", "blurred_volume", "sobel_vectors", "sobel_vectors_subsampled", "adjusted_vectors", "adjusted_vectors_interp", "first_derivative", "second_derivative", "mask_recto", "mask_verso"];
init();

async function init() {
    // renderer setup
    const canvas = document.querySelector(".webgl");
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(1, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const viewer = new ViewerCore({ renderer, canvas });

    update(viewer);
}

function update(viewer) {
    viewer.render();
    updateGUI(viewer);
    console.log(viewer.params);
    console.log(viewer.params.functions);
}

function updateGUI(viewer) {
    const gui = new GUI();
    const background = gui.addFolder("Background");
    const object = gui.addFolder("object");

    // background color
    background
        .addColor(viewer.params, "backgroundColor")
        .name("Background Color")
        .onChange(function (value) {
            viewer.renderer.setClearColor(value);
            viewer.render();
        });

    // ===========================================================================================
    // object color
    object.add(viewer.params, "colorful", true).name("color").onChange(viewer.render);

    // object functions
    object
        .add(viewer.params, "functions", input_files)
        .name("functions")
        .onChange(async function (value) {
            //載入新檔案
            await viewer.sdfTexGenerate(value);

            // 重新渲染
            viewer.render();
        });
}
