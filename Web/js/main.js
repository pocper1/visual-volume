import * as THREE from 'three';
import Tiff from 'tiff.js';

// 讀取 TIFF 檔案
fetch('Dataset/cell_yxz_007_009_014.tif')
    .then(response => response.arrayBuffer())
    .then(buffer => {
        const tiff = new Tiff({ buffer });
        const canvas = tiff.toCanvas();
        const context = canvas.getContext('2d');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // 將圖像數據轉換為 Three.js 可以處理的格式
        const texture = new THREE.DataTexture3D(imageData.data, canvas.width, canvas.height, 1);
        texture.format = THREE.RedFormat;
        texture.type = THREE.UnsignedByteType;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.unpackAlignment = 1;

        // 創建 3D 場景
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const geometry = new THREE.BoxGeometry(canvas.width, canvas.height, 1);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        camera.position.z = 5;

        const animate = function () {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        };

        animate();
    });