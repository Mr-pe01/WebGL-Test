// Cartoon Water 片元着色器（主光+环境光+高光+菲涅尔，卡通风格，优化版）

uniform vec3 lightDirection;    // 主光方向（世界空间，已归一化）
uniform vec3 lightColor;        // 主光颜色
uniform vec3 ambientColor;      // 环境光颜色
uniform vec3 baseColor;         // 水面基础色（建议深蓝绿）
uniform float brightness;       // 明暗全局控制
uniform float shadow;           // 阴影滑杆 0-1
uniform sampler2D normalMap;
uniform float time;
uniform float repeat;
uniform float speed;
uniform float specularThreshold;
uniform float specularStrength;
uniform float fresnelPower;
uniform float fresnelStrength;

varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBitangent;

void main() {
    // 法线扰动：双重流动
    vec3 n1 = texture2D(normalMap, vUv * repeat + vec2(time * speed, 0.0)).xyz * 2.0 - 1.0;
    vec3 n2 = texture2D(normalMap, vUv * repeat - vec2(time * speed * 0.6, 0.2)).xyz * 2.0 - 1.0;
    vec3 disturbedNormalTangent = normalize(mix(n1, n2, 0.5));
    // 用TBN变换到世界空间
    mat3 tbn = mat3(normalize(vTangent), normalize(vBitangent), normalize(vWorldNormal));
    vec3 disturbedNormalWorld = normalize(tbn * disturbedNormalTangent);
    // 叠加世界空间法线
    vec3 N = normalize(disturbedNormalWorld + vWorldNormal);

    // 视线方向（世界空间）
    vec3 V = normalize(cameraPosition - vWorldPosition);

    // 主光Half-Lambert
    float NdotL = dot(N, normalize(lightDirection));
    float halfLambert = clamp(NdotL * shadow + (1.0 - shadow), 0.0, 1.0);
    // 优化基础色为深蓝绿
    vec3 deepWaterColor = vec3(0.18, 0.6, 0.8); // 深蓝绿
    vec3 mainDiffuse = lightColor * deepWaterColor;
    vec3 ambient = ambientColor * deepWaterColor;
    // 主光和环境光插值混合
    vec3 cartoonDiffuse = (mainDiffuse * halfLambert + ambient * (1.0 - halfLambert)) * brightness;

    // 卡通高光（Blinn-Phong+分段，区域更窄，强度更低）
    vec3 H = normalize(normalize(lightDirection) + V);
    float NdotH = max(dot(N, H), 0.0);
    float cartoonSpec = smoothstep(specularThreshold, specularThreshold + 0.02, NdotH);
    vec3 specularColor = lightColor * cartoonSpec * specularStrength; // 更弱的高光

    // 菲涅尔（边缘泛蓝/白，更自然）
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 6.0 - fresnelPower); // 反转滑杆方向：UI滑杆1~5，实际指数5~1，更符合人类感官
    vec3 fresnelColor = mix(vec3(0.0, 0.4, 0.8), vec3(1.0), fresnel) * fresnelStrength; // 蓝到白，权重更低

    // 合成最终颜色
    vec3 color = cartoonDiffuse + specularColor + fresnelColor;
    gl_FragColor = vec4(color, 0.7); // 半透明水面
} 