#ifdef GL_ES
precision mediump float;
#endif

varying vec4 v_col;
varying vec2 v_tex0;
uniform sampler2D texture0;
uniform vec4 tint;

const float smoothing = 1.0/16.0;
const vec2 shadowOffset = vec2(-1.0/512.0);
const vec4 glowColor = vec4(vec3(0.1), 1.0);
const float glowMin = 0.2;
const float glowMax = 0.8;

// drop shadow computed in fragment shader
void main() {
    vec4 texColor = texture2D(texture0, v_tex0);
    float dst = texColor.a;
    float alpha = smoothstep(0.5 - smoothing, 0.5 + smoothing, dst);

    float glowDst = texture2D(texture0, v_tex0 + shadowOffset).a;
    vec4 glow = glowColor * smoothstep(glowMin, glowMax, glowDst);

    float mask = 1.0-alpha;

    vec4 base = v_col * vec4(vec3(1.0), alpha) * tint;
    gl_FragColor = mix(base, glow, mask);
}