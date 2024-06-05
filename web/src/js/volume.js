import * as THREE from "three";
import ViewerCore from "./core/ViewerCore";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";

const functionName = ["origin", "blurred_volume", "sobel_vectors", "sobel_vectors_subsampled", "adjusted_vectors", "adjusted_vectors_interp", "first_derivative", "second_derivative", "mask_recto", "mask_verso"];
const tifName = ["cell_yxz_006_008_004", "cell_yxz_007_006_022", "cell_yxz_008_010_005", "cell_yxz_010_011_003", "cell_yxz_015_013_008"];
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
}

function updateGUI(viewer) {
    const gui = new GUI();
    const fileSystem = gui.addFolder("File System");
    const background = gui.addFolder("Background Color");
    const object = gui.addFolder("Object");
    // const animation = gui.addFolder("Animation");

    // =====================================BACKGROUND======================================================
    background
        .addColor(viewer.params, "backgroundColor")
        .name("Background Color")
        .onChange(function (value) {
            viewer.renderer.setClearColor(value);
            viewer.render();
        });

    // =====================================OBJECT======================================================
    // object color
    object.add(viewer.params, "colorful", true).name("color").onChange(viewer.render);

    object
        .add(viewer.params, "colorMode", { Origin: 0, "RGB to BGR": 1, "reverse color": 2, "gray scale": 3, "Hue Rotation": 4, "Contrast Enhancement": 5 })
        .name("Color Mode")
        .onChange(function (value) {
            viewer.volumePass.material.uniforms.colorMode.value = value;
            viewer.render();
        });

    // animation
    //     .add(viewer.params, "animate")
    //     .name("Animate")
    //     .onChange(function (value) {
    //         viewer.params.animate = value;
    //         viewer.render();
    //     });

    // animation
    //     .add(viewer.params, "rotationSpeed", 0, 1)
    //     .step(0.1)
    //     .name("Rotation Speed")
    //     .onChange(function (value) {
    //         viewer.params.rotationSpeed = value;
    //         viewer.render();
    //     });

    // animation
    //     .add(viewer.params, "rotationAxis", ["x", "y", "z"])
    //     .name("Rotation Axis")
    //     .onChange(function (value) {
    //         viewer.params.rotationAxis = value;
    //         viewer.render();
    //     });

    // =====================================FILE SYSTEM======================================================

    fileSystem
        .add(viewer.params, "tifName", tifName)
        .name("tifName")
        .onChange(async function (value) {
            //載入新檔案
            await viewer.sdfTexGenerate(value);

            // 重新渲染
            viewer.render();
        });

    fileSystem
        .add(viewer.params, "functionName", functionName)
        .name("functionName")
        .onChange(async function (functionName) {
            //載入新檔案
            await viewer.sdfTexGenerate(functionName);

            // 重新渲染
            viewer.render();
        });
}
