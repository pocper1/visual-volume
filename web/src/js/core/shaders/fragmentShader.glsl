
precision highp sampler3D;

varying vec2 vUv;
uniform vec2 clim;
uniform vec3 size;
uniform bool colorful;
uniform int colorMode;
uniform float depth;
uniform int axis;
uniform vec3 dis_vec;

uniform sampler3D volumeTex;
uniform sampler2D cmdata;
uniform mat4 projectionInverse;
uniform mat4 sdfTransformInverse;

const float relative_step_size = 1.0;
const vec4 ambient_color = vec4(0.2, 0.4, 0.2, 1.0);
const vec4 diffuse_color = vec4(0.8, 0.2, 0.2, 1.0);
const vec4 specular_color = vec4(1.0, 1.0, 1.0, 1.0);
const float shininess = 40.0;

vec4 cast_mip(vec3 start_loc, vec3 step, int nsteps, vec3 view_ray);

vec4 apply_colormap(float val);
vec4 add_lighting(float val, vec3 loc, vec3 step, vec3 view_ray);

// distance to box bounds
vec2 rayBoxDist( vec3 boundsMin, vec3 boundsMax, vec3 rayOrigin, vec3 rayDir ) {
    vec3 t0 = ( boundsMin - rayOrigin ) / rayDir;
    vec3 t1 = ( boundsMax - rayOrigin ) / rayDir;
    vec3 tmin = min( t0, t1 );
    vec3 tmax = max( t0, t1 );
    float distA = max( max( tmin.x, tmin.y ), tmin.z );
    float distB = min( tmax.x, min( tmax.y, tmax.z ) );
    float distToBox = max( 0.0, distA );
    float distInsideBox = max( 0.0, distB - distToBox );
    return vec2( distToBox, distInsideBox );
}

void main() {
    float fragCoordZ = -1.;

    // get the inverse of the sdf box transform
    mat4 sdfTransform = inverse( sdfTransformInverse );

    // convert the uv to clip space for ray transformation
    vec2 clipSpace = 2.0 * vUv - vec2( 1.0 );

    // get world ray direction
    vec3 rayOrigin = vec3( 0.0 );
    vec4 homogenousDirection = projectionInverse * vec4( clipSpace, - 1.0, 1.0 );
    vec3 rayDirection = normalize( homogenousDirection.xyz / homogenousDirection.w );

    // transform ray into local coordinates of sdf bounds
    vec3 sdfRayOrigin = ( sdfTransformInverse * vec4( rayOrigin, 1.0 ) ).xyz;
    vec3 sdfRayDirection = normalize( ( sdfTransformInverse * vec4( rayDirection, 0.0 ) ).xyz );

    // find whether our ray hits the box bounds in the local box space
    vec2 boxIntersectionInfo = rayBoxDist( vec3( - 0.5 ), vec3( 0.5 ), sdfRayOrigin, sdfRayDirection );
    float distToBox = boxIntersectionInfo.x;
    float distInsideBox = boxIntersectionInfo.y;
    bool intersectsBox = distInsideBox > 0.0;
    gl_FragColor = vec4( 0.0 );

    if ( intersectsBox ) {
        int nsteps = int(boxIntersectionInfo.y * size.x / relative_step_size + 0.5);
        if ( nsteps < 1 ) discard;

        // For testing: show the number of steps. This helps to establish whether the rays are correctly oriented
        // gl_FragColor = vec4(0.0, float(nsteps) / size.x, 1.0, 1.0);
        // return;

        vec4 boxNearPoint = vec4( sdfRayOrigin + sdfRayDirection * ( distToBox + 1e-5 ), 1.0 );
        vec4 boxFarPoint = vec4( sdfRayOrigin + sdfRayDirection * ( distToBox + distInsideBox - 1e-5 ), 1.0 );
        vec3 pn = (sdfTransform * boxNearPoint).xyz;
        vec3 pf = (sdfTransform * boxFarPoint).xyz;

        // add 
        vec3 uv = (sdfTransformInverse * vec4(pn, 1.0)).xyz + vec3( 0.5 );
        vec4 volumeColor;

     
        vec3 uvx = vec3(depth, uv.y, uv.z);  // slice x
        vec3 uvy = vec3(uv.x, depth, uv.z);  // slice y
        vec3 uvz = vec3(uv.x,  uv.y, depth); // slice z
        float v;
        float threshold = 0.05;

        if (abs(dis_vec.z - 2.0) < threshold || abs(dis_vec.z - 0.0) < threshold ) {
            vec3 uvz = vec3(uv.x,  uv.y, depth); // slice z
            v = texture(volumeTex, uvz).r;
            volumeColor = vec4(v, v, v, 1.0);

            gl_FragColor = volumeColor;
            return;
        } 

        
        else if (abs(dis_vec.y - 2.0) < threshold || abs(dis_vec.y - 0.0) < threshold ) {
            vec3 uvy = vec3(uv.x, depth, uv.z);  // slice y
            v = texture(volumeTex, uvy).r; // 對齊 y
            volumeColor = vec4(v, v, v, 1.0);

            gl_FragColor = volumeColor;
            return;
        } else if (abs(dis_vec.x - 2.0) < threshold || abs(dis_vec.x - 0.0) < threshold ) {
            vec3 uvx = vec3(depth, uv.y, uv.z);  // slice x
            v = texture(volumeTex, uvx).r; // 對齊 x
            volumeColor = vec4(v, v, v, 1.0);

            gl_FragColor = volumeColor;
            return;
        }   else {
            float thickness = length(pf - pn);
            nsteps = int(thickness * size.x / relative_step_size + 0.5);
            
            if ( nsteps < 1 ) discard;
            
            vec3 step = sdfRayDirection * thickness / float(nsteps);
            volumeColor = cast_mip(uv, step, nsteps, sdfRayDirection);
        }

        gl_FragColor = volumeColor;
        return;
    }

    if (gl_FragColor.a < 0.05){ 
        discard; 
    }
}

vec3 hueRotate(vec3 color, float angle) {
    const mat3 kRGBToYPrime = mat3(
        0.299, 0.587, 0.114,
        0.299, 0.587, 0.114,
        0.299, 0.587, 0.114
    );

    const mat3 kPrimeToRGB = mat3(
        1.0, 0.0, 1.402,
        1.0, -0.344, -0.714,
        1.0, 1.772, 0.0
    );

    float cosA = cos(angle);
    float sinA = sin(angle);

    mat3 hueRotation = mat3(
        0.213 + cosA * 0.787 - sinA * 0.213, 0.213 - cosA * 0.213 + sinA * 0.143, 0.213 - cosA * 0.213 - sinA * 0.787,
        0.715 - cosA * 0.715 - sinA * 0.715, 0.715 + cosA * 0.285 + sinA * 0.140, 0.715 - cosA * 0.715 + sinA * 0.715,
        0.072 - cosA * 0.072 + sinA * 0.928, 0.072 - cosA * 0.072 - sinA * 0.283, 0.072 + cosA * 0.928 + sinA * 0.072
    );

    return clamp(color * hueRotation, 0.0, 1.0);
}

vec3 enhanceContrast(vec3 color, float factor) {
    return clamp((color - 0.5) * factor + 0.5, 0.0, 1.0);
}

vec4 apply_colormap(float val) {
    float v = (val - clim[0]) / (clim[1] - clim[0]);
    vec4 color = texture2D(cmdata, vec2(v, 0.5));

    if (colorMode == 1) {
        color = color.bgra; // RGB to BGR
    } else if (colorMode == 2) {
        color.rgb = 1.0 - color.rgb; // 反轉顏色
    }else if (colorMode == 3) {
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color = vec4(vec3(gray), color.a);
    }else if (colorMode == 4) {
        color.rgb = hueRotate(color.rgb, 1.0); // 顏色位移
    }else if (colorMode == 5) {
        color.rgb = enhanceContrast(color.rgb, 2.0); // 對比度增強因子
    }

    return color;
    // return vec4(vec3(val), 1.0);
}

vec4 cast_mip(vec3 start_loc, vec3 step, int nsteps, vec3 view_ray) {
    float max_val = -1e6;
    int max_i = 100;
    vec3 loc = start_loc;

    // float val = texture(volumeTex, start_loc).r;
    // return apply_colormap(val);

    // Enter the raycasting loop. In WebGL 1 the loop index cannot be compared with
    // non-constant expression. So we use a hard-coded max, and an additional condition
    // inside the loop.
    for (int iter=0; iter<MAX_STEPS; iter++) {
        if (iter >= nsteps)
        break;
        // Sample from the 3D texture
        float val = texture(volumeTex, loc).r;
        // Apply MIP operation
        if (val > max_val) {
        max_val = val;
        max_i = iter;
        }
        // Advance location deeper into the volume
        loc += step;
    }


    // Resolve final color
    return apply_colormap(max_val);
}