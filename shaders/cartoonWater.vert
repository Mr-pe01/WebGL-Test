// Cartoon Water 顶点着色器
varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vTangent;
varying vec3 vBitangent;

attribute vec3 tangent;

void main() {
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vUv = uv;
    vec3 n = normalize(mat3(modelMatrix) * normal);
    vec3 t = normalize(mat3(modelMatrix) * tangent);
    vec3 b = cross(n, t);
    vWorldNormal = n;
    vTangent = t;
    vBitangent = b;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
} 