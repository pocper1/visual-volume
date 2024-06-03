import * as THREE from "three";
import Loader from "../Loader";
import { VolumeMaterial } from "./VolumeMaterial";
import { GenerateSDFMaterial } from "./GenerateSDFMaterial";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import textureViridis from "./textures/cm_viridis.png";

export default class ViewerCore {
    constructor({ meta, renderer, canvas }) {
        this.canvas = canvas;
        this.renderer = renderer;
        this.render = this.render.bind(this);

        this.meta = meta;
        this.inverseBoundsMatrix = new THREE.Matrix4();
        this.volumePass = new FullScreenQuad(new VolumeMaterial());
        
        this.cmtextures = { viridis: new THREE.TextureLoader().load(textureViridis) };

        this.params = {};

        this.params.segmentVisible = true;
        this.params.sliceVisible = true;
        this.params.labelVisible = true;

        this.params.sliceX = 0.5;
        this.params.sliceY = 0.5;
        this.params.sliceZ = 0.5;

        this.params.colorful = true;
        this.params.surface = 0.002;
        this.params.label = 0;
        this.params.tlabel = 0.01;

        this.params.file = "sobel_vectors";

        this.init();
    }

    async init() {
        // scene setup
        this.scene = new THREE.Scene();

        this.scene.background = new THREE.Color(0x000000); // background color

        // axes
        const axesHelper = new THREE.AxesHelper(150);
        this.scene.add(axesHelper);

        // this.scene.add(this.cube);

        // camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 50);
        this.camera.position.copy(new THREE.Vector3(0, 0, -1).multiplyScalar(1.0));
        this.camera.up.set(0, -1, 0);
        this.camera.far = 5;
        this.camera.updateProjectionMatrix();

        window.addEventListener(
            "resize",
            () => {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.render();
            },
            false
        );

        const controls = new OrbitControls(this.camera, this.canvas);
        controls.addEventListener("change", this.render);

        this.cmtextures.viridis.minFilter = THREE.NearestFilter;
        this.cmtextures.viridis.maxFilter = THREE.NearestFilter;
        this.volumePass.material.uniforms.cmdata.value = this.cmtextures.viridis;

        // import model
        this.GLTFGenerate(this.params.file);
    }

    async GLTFGenerate(file) {
        console.log(`Loading GLTF file: output/${file}.gltf`);
        const gltf = await Loader.getGLTFData(`output/${file}.gltf`);
        
        if (!gltf) {
            console.error('Failed to load the GLTF file.');
            return;
        }
    
        console.log('GLTF data:', gltf);
    
        if (!gltf.scene || gltf.scene.children.length === 0) {
            console.error('The GLTF file does not contain a scene or the scene has no children.');
            return;
        }
        
        const mesh = gltf.scene.children[0];
        
        if (!mesh.isMesh) {
            console.error('The first child of the scene is not a mesh.');
            return;
        }
        
        console.log('Mesh:', mesh);
    
        this.scene.add(mesh);
        mesh.position.set(0, 0, 0);
        mesh.scale.set(10, 10, 10);
        this.render();
    }


    render() {
        if (!this.renderer) return;

        // 更新攝影機的世界矩陣
        this.camera.updateMatrixWorld();

        // 使用 renderer 的 render 方法來渲染場景
        this.renderer.render(this.scene, this.camera);
    }
}
