// Half-Lambert 顶点着色器
precision mediump float;
varying vec3 vNormalW;

void main() {
    // 法线变换到世界空间
    vNormalW = normalize(mat3(modelMatrix) * normal);
    // “用”一下vNormalW，防止被优化掉
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
} 