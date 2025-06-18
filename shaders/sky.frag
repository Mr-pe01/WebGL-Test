uniform vec3 topColor;
uniform vec3 middleColor;
uniform vec3 bottomColor;
uniform float offset;
uniform float exponent;

varying vec3 vWorldPosition;

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