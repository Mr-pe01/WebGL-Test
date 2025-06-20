// Half-Lambert 片元着色器（主光+环境光，插值混合，去除补光）
// 主光：主方向光，环境光：全局环境色

precision mediump float;
uniform vec3 lightDirection;    // 主光方向（世界空间，已归一化）
uniform vec3 lightColor;        // 主光颜色
uniform vec3 ambientColor;      // 环境光颜色
uniform vec3 baseColor;         // 物体基础色
uniform float brightness;       // 明暗全局控制
uniform float shadow;           // 阴影滑杆 0-1

varying vec3 vNormalW;

void main() {
    // 世界空间法线归一化
    vec3 N = normalize(vNormalW);

    // 主光Half-Lambert
    float NdotL = dot(N, normalize(lightDirection));
    float halfLambert = clamp(NdotL * shadow + (1.0 - shadow), 0.0, 1.0);
    vec3 mainDiffuse = lightColor * baseColor;
    vec3 ambient = ambientColor * baseColor * 0.35; // 0.35 降低环境光的影响强度

    // 主光和环境光插值混合
    // 主光权重 = halfLambert，环境光权重 = 1 - halfLambert
    vec3 color = (mainDiffuse * halfLambert + ambient * (1.0 - halfLambert)) * brightness;

    gl_FragColor = vec4(color, 1.0);
} 