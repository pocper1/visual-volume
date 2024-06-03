import * as THREE from "three";
import { NRRDLoader } from "three/examples/jsm/loaders/NRRDLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

export default class Loader {
    constructor() {}

    static getTexture(filename) {
        return new THREE.TextureLoader().loadAsync(filename);
    }

    static getVolumeData(filename) {
        return new NRRDLoader().loadAsync(filename);
    }

    static getGLTFData(filename) {
        console.log("getGLTFData");
        return new GLTFLoader().loadAsync(filename);
        
    }
}
