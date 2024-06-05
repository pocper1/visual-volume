import { ShaderMaterial, Matrix4, Vector2, Vector3 } from "three";
import vertexShader from "./shaders/vertexShader.glsl";
import fragmentShader from "./shaders/fragmentShader.glsl";

export class VolumeMaterial extends ShaderMaterial {
    constructor(params) {
        super({
            defines: {
                // The maximum distance through our rendering volume is sqrt(3).
                MAX_STEPS: 887, // 887 for 512^3, 1774 for 1024^3
                SURFACE_EPSILON: 0.001,
            },

            uniforms: {
                cmdata: { value: null },
                volumeTex: { value: null },
                clim: { value: new Vector2(0.4, 1.0) },
                size: { value: new Vector3() },
                projectionInverse: { value: new Matrix4() },
                sdfTransformInverse: { value: new Matrix4() },
                colorful: { value: true },
                // functionName: { value: 0 },
                colorMode: { value: 0 },
                // rotationMatrix: { value: new Matrix4() },
                // modelMatrix: { value: new Matrix4() },
            },

            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });
    }
}
// 1. nrrd 的資料範圍 輸入要注意
// 2. 色彩分布圖（控制分佈圖)
// 3. 透明度
// 4. ray tracing optimize(?)
// 5. 使用者操作到正前方只顯示切面資訊(對齊某一軸只顯示切面 往上滾比較深的切面、往下滾比較淺的資料)
// 6. fun ction 切換每個都可以跑出來()
// 7. sobel(300, 300, 300, 3) => 可以做灰色(相加除以三)
// 8. first derivative(綠色：正，跟紅色：負 要想辦法呈現出來)
