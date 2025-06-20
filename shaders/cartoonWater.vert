// Cartoon Water 顶点着色器
varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec3 vWorldNormal;

void main() {
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vUv = uv;
    // 法线变换到世界空间
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
} 