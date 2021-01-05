uniform sampler2D uTexturePosition;
uniform float uParticleSize;

varying float vHalfSize;
varying float vLife;

void main() {
    vec4 positionInfo = texture2D(uTexturePosition, position.xy);

    vec4 mvPosition = modelViewMatrix * vec4(positionInfo.xyz, 1.0);

    gl_PointSize = position.z / length(mvPosition.xyz) * smoothstep(0.0, 0.2, positionInfo.w) * uParticleSize;

    vHalfSize = gl_PointSize * 0.5;
    vLife = positionInfo.w;

    gl_Position = projectionMatrix * mvPosition;
    gl_Position.y += step(200.0, gl_PointSize) * 8192.0;
}
