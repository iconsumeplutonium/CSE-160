export const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const fragmentShader = `
uniform sampler2D tDiffuse;
uniform vec4 u_CameraPos;
uniform float u_UnderwaterThreshold;

varying vec2 vUv;

void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    vec4 underwaterColor = vec4(0.04, 0.368, 1.0, 1.0);               
    
    gl_FragColor = (u_CameraPos.y <= u_UnderwaterThreshold) ? mix(color, underwaterColor, 0.5) : color;
}`