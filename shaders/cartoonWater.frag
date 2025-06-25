// Cartoon Water 片元着色器（主光+环境光+高光+菲涅尔，卡通风格，优化版）

const int MAX_WAVES = 5;

uniform vec3 lightDirection;    // 主光方向（世界空间，已归一化）
uniform vec3 lightColor;        // 主光颜色
uniform vec3 ambientColor;      // 环境光颜色
uniform vec3 baseColor;         // 水面基础色（建议深蓝绿）
uniform float brightness;       // 明暗全局控制
uniform float shadow;           // 阴影滑杆 0-1
uniform sampler2D normalMap;
uniform sampler2D ringNormalMap; // 新增：圈法线贴图
uniform float time;
uniform float repeat;
uniform float speed;
uniform float specularThreshold;
uniform float specularStrength;
uniform float fresnelPower;
uniform float fresnelStrength;
uniform float waterNormalStrength;
uniform int waveCount;
uniform vec2 waveCenters[5];
uniform float waveStartTimes[5];

varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBitangent;

vec3 blendNormal(vec3 n1, vec3 n2) {
    // n1, n2 都是 [-1,1] 空间的法线
    vec3 t;
    t.xy = n1.xy + n2.xy;
    t.z = n1.z * n2.z;
    return normalize(t);
}

void main() {
    // 法线扰动：双重流动
    vec3 n1 = texture2D(normalMap, vUv * 0.85 * repeat + vec2(time * speed, 0.0)).xyz * 2.0 - 1.0;
    vec3 n2 = texture2D(normalMap, vUv * repeat - vec2(time * speed * 0.6, 0.2)).xyz * 2.0 - 1.0;
    vec3 disturbedNormalTangent = blendNormal(n1, n2);
    disturbedNormalTangent.xy *= waterNormalStrength;

    // 波纹法线贴图叠加
    for (int i = 0; i < MAX_WAVES; i++) {
        if (i >= waveCount) break;
        float t = time - waveStartTimes[i];
        if (t > 0.0 && t < 1.5) {
            float dist = distance(vUv, waveCenters[i]);
            float radius = t * 0.25;
            float ringUvScale = 0.18; // 控制圈的粗细（可调）
            // 将vUv映射到圈贴图的[0,1]范围
            vec2 ringUv = (vUv - waveCenters[i]) / (radius + ringUvScale) + 0.5;
            // 只在圈附近采样
            if (all(greaterThanEqual(ringUv, vec2(0.0))) && all(lessThanEqual(ringUv, vec2(1.0)))) {
                vec3 ringNormal = texture2D(ringNormalMap, ringUv).xyz * 2.0 - 1.0;
                float fade = 1.0 - t / 1.5;
                // 叠加到tangent空间法线
                disturbedNormalTangent = blendNormal(disturbedNormalTangent, mix(vec3(0,0,1), ringNormal, fade));
            }
        }
    }

    // 用TBN变换到世界空间
    mat3 tbn = mat3(normalize(vTangent), normalize(vBitangent), normalize(vWorldNormal));
    vec3 disturbedNormalWorld = normalize(tbn * disturbedNormalTangent);
    // 最终法线
    vec3 N = disturbedNormalWorld;

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

    vec3 H = normalize(normalize(lightDirection) + V);
    float NdotH = max(dot(N, H), 0.0);
    
    float sharpness = exp2(10.0 * (1.0 - specularThreshold) + 1.0);
    float cartoonSpec = pow(NdotH, sharpness);
    cartoonSpec = clamp(cartoonSpec, 0.0, 1.0);
    
    vec3 specularColor = lightColor * cartoonSpec * specularStrength;

    // 菲涅尔（边缘泛蓝/白，更自然）
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 6.0 - fresnelPower);
    vec3 fresnelColor = mix(vec3(0.0, 0.4, 0.8), vec3(1.0), fresnel) * fresnelStrength;

    // 合成最终颜色
    vec3 color = cartoonDiffuse + specularColor + fresnelColor;

    gl_FragColor = vec4(color, 0.7); // 半透明水面
}
