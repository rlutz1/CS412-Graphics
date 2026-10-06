/**
 * file to encap the either static grab or dynamic
 * generation of vertex shaders for different nodes.
 * 
 * this is kept as a json -- will be fleshing out more later.
 */

const basic_frag_shader = {
  "src": `#version 300 es
    precision mediump float;
    in vec3 vColor;

    out vec4 fragColor;

    void main() {
      fragColor = vec4(vColor,1.0);
    }
  `
}