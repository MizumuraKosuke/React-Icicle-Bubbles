uniform sampler2D uTexturePosition;
uniform sampler2D uTexturePrevPosition;
uniform float uParticleSize;
uniform mat4 uPrevModelViewMatrix;

varying vec2 vMotion;

void main() {
    vec4 positionInfo = texture2D(uTexturePosition, position.xy);
    vec4 prevPositionInfo = texture2D(uTexturePrevPosition, position.xy);

    vec4 mvPosition = modelViewMatrix * vec4(positionInfo.xyz, 1.0);

    vec4 pos = projectionMatrix * mvPosition;
    vec4 prevPos = projectionMatrix * uPrevModelViewMatrix * vec4(prevPositionInfo.xyz, 1.0);

    vMotion = (pos.xy / pos.w - prevPos.xy / prevPos.w) * 0.5 * step(positionInfo.w, prevPositionInfo.w);

    gl_PointSize = position.z / length(mvPosition.xyz) * smoothstep(0.0, 0.2, positionInfo.w) * uParticleSize;
    gl_Position = pos;
    gl_Position.y += step(200.0, gl_PointSize) * 8192.0;
}
