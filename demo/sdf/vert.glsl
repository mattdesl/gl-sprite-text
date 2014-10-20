attribute vec4 position;
attribute vec4 color;
attribute vec2 texcoord0;
uniform mat4 projection;
uniform mat4 view;
varying vec4 v_col;
varying vec2 v_tex0;

void main() {
   gl_Position = projection * view * position;
   v_col = color;
   v_tex0 = texcoord0;
   gl_PointSize = 1.0;
}