/*
  this file contains the modular forms of transformation functions.
  they may be referenced by their names from the top level "function" dictionary.

  these can be compiled as shaders, treated as library functions for use in the 
  main object affine transformations.
 */


// rotation by d degrees function.
// TODO: specify directionality. (clockwise...)

const header_end = `/*===== END HEADER ======*/`

const medium_p_header = `#version 300 es 
  precision mediump float;
  ${header_end}
  `

const rotation = `
  vec3 rotate(float d, vec3 to_rotate) {
    // rotation matrix 
     mat3 rot = mat3(
      cos(d), sin(d), 0.0,
      -sin(d), cos(d), 0.0,
      0.0, 0.0, 1.0
    );

    return  rot * to_rotate;
  } // end method
  `

const vert_shader = `${medium_p_header}
  ${rotation}
  in vec3 aPosition;
  in vec3 aColor;

  uniform float uTime; //time in sec
  out vec3 vColor;

  void main() {
    // final position
    gl_Position = vec4(rotate(uTime, aPosition), 1.0);
    vColor = aColor;
  }
  `