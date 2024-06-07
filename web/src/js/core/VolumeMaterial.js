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
                colorMode: { value: 0 },
                // rotationMatrix: { value: new Matrix4() },
                // modelMatrix: { value: new Matrix4() },
                axis: { value: 0 }, // 新增 axis uniform
                depth: { value: 0.5 }, // 新增 depth uniform
                displayMode: { value: 0 },
                dis_vec: { value: new Vector3()  },
                
            },

            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });
    }
}
