// ===================================================================
// 🌈 卡通天空盒着色器 - 简单兼容版
// 功能：创建三色渐变的卡通天空效果
// 特点：不使用#ifdef，更好的浏览器兼容性
// ===================================================================

/*
 * 💡 Unity风格但更简单的做法：
 * 
 * 不使用预处理器指令，而是用JavaScript来分离shader代码
 * 这样可以确保在所有WebGL实现中都能正常工作
 */

// ===================================================================
// 🔧 Uniform变量和Varying变量声明
// ===================================================================
uniform vec3 topColor;
uniform vec3 middleColor;
uniform vec3 bottomColor;
uniform float offset;
uniform float exponent;

varying vec3 vWorldPosition;

// ===================================================================
// 📄 顶点着色器部分 - VERTEX_SHADER_START 到 VERTEX_SHADER_END
// ===================================================================
// VERTEX_SHADER_START
void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
// VERTEX_SHADER_END

// ===================================================================
// 📄 片元着色器部分 - FRAGMENT_SHADER_START 到 FRAGMENT_SHADER_END
// ===================================================================
// FRAGMENT_SHADER_START
void main() {
    float h = normalize(vWorldPosition + offset).y;
    
    vec3 color;
    if (h < 0.5) {
        color = mix(bottomColor, middleColor, h * 2.0);
    } else {
        color = mix(middleColor, topColor, (h - 0.5) * 2.0);
    }
    
    gl_FragColor = vec4(color, 1.0);
}
// FRAGMENT_SHADER_END 