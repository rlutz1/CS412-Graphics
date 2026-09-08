/*
  this file contains the modular forms of transformation functions.
  they may be referenced by their names from the top level "function" dictionary.

  these can be compiled as shaders, treated as library functions for use in the 
  main object affine transformations.
 */

/* READABILITY CONSTANTS*/
const header_tag = `/*===== END HEADER ======*/`
const library_tag = `/*===== LIBRARY FUNCS ======*/`
const main_tag = `/*===== MAIN ======*/`

/* A BASIC MEDIUM P HEADER */
const medium_p_header = `#version 300 es 
  precision mediump float;
  ${header_tag}
  `

/* ROTATION FUNCTION */
const rotation = `/* rotate a 3 element vector in a given direction */
  vec3 rotate(float d, vec3 to_rotate, bool clockwise) {
    // rotation matrix 
    mat3 rot;

    if (clockwise) {
      // clockwise rotation matrix
      rot = mat3(
        cos(d), -sin(d), 0.0,
        sin(d), cos(d), 0.0,
        0.0, 0.0, 1.0
      );
    } else {
      // counter clockwise rotation matrix
      rot = mat3(
        cos(d), sin(d), 0.0,
        -sin(d), cos(d), 0.0,
        0.0, 0.0, 1.0
      );
    } // end if

    return  rot * to_rotate;
  } // end method
  `

/* OPTIONAL: entire library of transformation functions together */

const library = `${library_tag}
  ${rotation}
  `

/* VERT SHADER USED BY DEFAULT */
const vert_shader = `${medium_p_header}
  ${library}
  ${main_tag}
  in vec3 aPosition;
  in vec3 aColor;

  uniform float uTime; //time in sec
  out vec3 vColor;

  void main() {
    // final position
    gl_Position = vec4(rotate(uTime, aPosition, true), 1.0);
    vColor = aColor;
  }
  `