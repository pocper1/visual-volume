import * as THREE from "three";
import Loader from "./Loader";
import ViewerCore from "./core/ViewerCore";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";

let gui;
const files = ["origin", "sobel", "sobel_vectors_subsample", "mask_recto", " mask_verso", "adjusted_vectors", "adjusted_vectors_interp"];

init(files);

async function init(files) {
    // renderer setup
    const canvas = document.querySelector(".webgl");
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // const meta = await Loader.getMeta()
    const meta = {};
    const viewer = new ViewerCore({ meta, renderer, canvas });
    update(viewer, files);
}

function update(viewer, files) {
    viewer.render();
    updateGUI(viewer, files);
}

function updateGUI(viewer, files) {
    if (gui) gui.destroy();
    gui = new GUI();

    const segment = gui.addFolder("segment");
    const slice = gui.addFolder("slice");
    const label = gui.addFolder("label");
    const fileFolder = gui.addFolder("Files");

    fileFolder
        .add(viewer.params, "file", files)
        .name("File")
        .onChange(file => {
            // 移除舊的物件
            if (viewer.volumeObj) {
                viewer.scene.remove(viewer.volumeObj);
            }
            if (viewer.vtkObj) {
                viewer.scene.remove(viewer.vtkObj);
            }

            // 延遲加載資料
            const loadData = () => {
                const loader = new GLTFLoader();
                loader.load(`output/${file}.gltf`, (gltf) => {
                    viewer.gltfObj = gltf.scene;
                    viewer.scene.add(gltf.scene);
                    gltf.scene.position.set(0, 0, 0);
                    gltf.scene.scale.set(10, 10, 10);
                    viewer.render();
                });
            };

            // 如果已經在視圖中，則立即加載資料
            if (viewer.isInView(file)) {
                loadData();
            } else {
                // 否則，當檔案進入視圖時加載資料
                viewer.onEnterView(file, loadData);
            }
        });

    segment.add(viewer.params, "segmentVisible").name("visible").onChange(viewer.render);
    segment.add(viewer.params, "colorful", true).name("color").onChange(viewer.render);
    segment.add(viewer.params, "surface", 0.002, 0.7).name("surface").onChange(viewer.render);

    slice.add(viewer.params, "sliceVisible").name("visible").onChange(viewer.render);
    slice.add(viewer.params, "sliceX", -0.5, 0.5).name("x").onChange(viewer.render);
    slice.add(viewer.params, "sliceY", -0.5, 0.5).name("y").onChange(viewer.render);
    slice.add(viewer.params, "sliceZ", -0.5, 0.5).name("z").onChange(viewer.render);

    label.add(viewer.params, "label", 0, 1).name("label").onChange(viewer.render);
    label.add(viewer.params, "tlabel", 0.01, 0.06).name("thickness").onChange(viewer.render);
}
