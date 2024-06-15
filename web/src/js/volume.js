import * as THREE from "three";
import ViewerCore from "./core/ViewerCore";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
import { functionName, tifName } from "./config";

init();

async function init() {
    // renderer setup
    const canvas = document.querySelector(".webgl");
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    document.addEventListener("DOMContentLoaded", functionDescription);

    const viewer = new ViewerCore({ renderer, canvas });

    update(viewer);
}

function functionDescription() {
    const container = document.getElementById("descriptions-container");

    if (!window.keydownEventSet) {
        document.addEventListener("keydown", function () {
            var descriptionsContainer = document.getElementById("descriptions-container");
            if (descriptionsContainer) {
                descriptionsContainer.style.display = "none";
            }
        });
        window.keydownEventSet = true;
    }
}
function update(viewer) {
    viewer.render();
    updateGUI(viewer);
}

function updateGUI(viewer) {
    const gui = new GUI();

    gui.title("Control panel");

    const fileSystem = gui.addFolder("File System");
    const background = gui.addFolder("Background Color");
    const object = gui.addFolder("Object");

    // =====================================BACKGROUND======================================================
    background
        .addColor(viewer.params, "backgroundColor")
        .name("Background Color")
        .onChange(function (value) {
            viewer.renderer.setClearColor(value);
            viewer.render();
        });

    // =====================================OBJECT======================================================

    object
        .add(viewer.params, "colorMode", { Origin: 0, "RGB to BGR": 1, "reverse color": 2, "gray scale": 3, "Hue Rotation": 4, "Contrast Enhancement": 5 })
        .name("Color Mode")
        .onChange(function (value) {
            viewer.volumePass.material.uniforms.colorMode.value = value;
            viewer.render();
        });

    // =====================================FILE SYSTEM======================================================

    fileSystem
        .add(viewer.params, "tifName", tifName)
        .name("tifName")
        .onChange(async function (value) {
            await viewer.sdfTexGenerate(value);
            viewer.render();
        });

    fileSystem
        .add(viewer.params, "functionName", functionName)
        .name("functionName")
        .onChange(async function (functionName) {
            await viewer.sdfTexGenerate(functionName);
            viewer.render();
        });
}
