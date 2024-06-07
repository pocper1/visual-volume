import * as THREE from "three";
import { VolumeMaterial } from "./VolumeMaterial";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { NRRDLoader } from "three/examples/jsm/loaders/NRRDLoader";
import textureViridis from "./textures/cm_viridis.png";

export default class ViewerCore {
    constructor({ renderer, canvas }) {
        this.canvas = canvas;
        this.renderer = renderer;
        this.render = this.render.bind(this);

        this.inverseBoundsMatrix = new THREE.Matrix4();
        this.volumePass = new FullScreenQuad(new VolumeMaterial()); // full screen quad with volume material
        // this.cube = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), new THREE.MeshBasicMaterial());
        this.cmtextures = { viridis: new THREE.TextureLoader().load(textureViridis) };

        this.params = {};
        this.params.colorful = true;
        this.params.tifName = "cell_yxz_006_008_004"; // fileName
        this.params.functionName = "origin";
        this.params.backgroundColor = "#000000";
        this.params.colorMode = 0; // Color mode: Origin: 0, "RGB to BGR": 1, "reverse color": 2, "gray scale": 3, "Hue Rotation": 4, "Contrast Enhancement": 5 })

        this.volumePass.material.uniforms.colorMode.value = this.params.colorMode;
        this.init();
    }

    async init() {
        // scene setup
        this.scene = new THREE.Scene();
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

        // 在 ViewerCore 的 init 函數中設置事件監聽
        window.addEventListener("keydown", event => {
            if (event.key === "x") {
                this.volumePass.material.uniforms.axis.value = 0;
            } else if (event.key === "y") {
                this.volumePass.material.uniforms.axis.value = 1;
            } else if (event.key === "z") {
                this.volumePass.material.uniforms.axis.value = 2;
            } else if (event.key === "ArrowUp") {
                this.volumePass.material.uniforms.direction.value = 0; // 前面
            } else if (event.key === "ArrowDown") {
                this.volumePass.material.uniforms.direction.value = 1; // 後面
            }
            this.render();
        });

        document.addEventListener("wheel", event => {
            const delta = event.deltaY * 0.001;
            this.volumePass.material.uniforms.depth.value = THREE.MathUtils.clamp(this.volumePass.material.uniforms.depth.value + delta, 0, 1);
            console.log("depth: " + this.volumePass.material.uniforms.depth.value);
            this.render();
        });

        const controls = new OrbitControls(this.camera, this.canvas);
        controls.addEventListener("change", this.render);

        this.cmtextures.viridis.minFilter = THREE.NearestFilter;
        this.cmtextures.viridis.maxFilter = THREE.NearestFilter;
        this.volumePass.material.uniforms.cmdata.value = this.cmtextures.viridis;

        await this.sdfTexGenerate();
    }

    async sdfTexGenerate() {
        const safePath = this.safeJoin(this.params.tifName, this.params.functionName + ".nrrd");
        const volume = await new NRRDLoader().loadAsync(safePath);

        const { xLength: w, yLength: h, zLength: d } = volume;

        const matrix = new THREE.Matrix4();
        const center = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const scaling = new THREE.Vector3();
        const s = 1 / Math.max(w, h, d);

        scaling.set(w * s, h * s, d * s);
        matrix.compose(center, quat, scaling);
        this.inverseBoundsMatrix.copy(matrix).invert();

        const volumeTex = new THREE.Data3DTexture(volume.data, w, h, d);
        volumeTex.format = THREE.RedFormat;
        volumeTex.type = THREE.UnsignedByteType;
        volumeTex.minFilter = THREE.NearestFilter;
        volumeTex.magFilter = THREE.NearestFilter;
        volumeTex.needsUpdate = true;

        this.volumePass.material.uniforms.volumeTex.value = volumeTex;
        this.volumePass.material.uniforms.size.value.set(w, h, d);
        this.volumePass.material.uniforms.cmdata.value = this.cmtextures.viridis;
        this.render();
    }

    safeJoin(base, target) {
        return base + "/" + target.replace(/^\//, "");
    }

    render() {
        if (!this.renderer) return;

        // this.renderer.render(this.scene, this.camera);
        const tolerance = 0.1;

        let xComponent = this.camera.matrixWorld["elements"][8];
        let yComponent = this.camera.matrixWorld["elements"][9];
        let zComponent = this.camera.matrixWorld["elements"][10];
        
        let dis = new THREE.Vector3(xComponent, yComponent, zComponent);
        let dis_vec_x = dis.distanceTo(new THREE.Vector3(1, 0, 0));
        let dis_vec_y = dis.distanceTo(new THREE.Vector3(0, 1, 0));
        let dis_vec_z = dis.distanceTo(new THREE.Vector3(0, 0, 1));

        let dis_vec = new THREE.Vector3(dis_vec_x, dis_vec_y, dis_vec_z);
        console.log(dis_vec);

        this.volumePass.material.uniforms.colorful.value = this.params.colorful;
        this.volumePass.material.uniforms.colorMode.value = this.params.colorMode;

        this.camera.updateMatrixWorld();

        // 計算位置資訊
        this.volumePass.material.uniforms.projectionInverse.value.copy(this.camera.projectionMatrixInverse);
        this.volumePass.material.uniforms.sdfTransformInverse.value.copy(new THREE.Matrix4()).invert().premultiply(this.inverseBoundsMatrix).multiply(this.camera.matrixWorld);

        this.volumePass.material.uniforms.dis_vec.value = dis_vec;

        this.volumePass.render(this.renderer);
    }
}
