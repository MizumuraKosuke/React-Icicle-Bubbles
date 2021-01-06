uniform vec2 u_resolution;
uniform sampler2D tDiffuse;

#pragma glslify: fxaa = require(glsl-fxaa)

void main() {
    gl_FragColor = fxaa(tDiffuse, gl_FragCoord.xy, u_resolution);
}
