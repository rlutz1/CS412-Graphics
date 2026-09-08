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

/* TRANSLATION FUNCTIOIN */
// Translation (tx, ty)
const translation = `/* translate 3 element vector by tx, ty */
  vec3 translate(float tx, float ty, vec3 to_translate) {
    // translation matrix
    mat3 trans = mat3(
    1.0, 0.0, 0.0,  
    0.0, 1.0, 0.0,
     tx,  ty, 1.0 // 1.0 -> 0.0
    );

    return trans * to_translate;
  } // end method
  `

/* ROTATION FUNCTION */
const rotation = `/* rotate a 3 element vector in a given direction */
  vec3 rotate(float degrees, vec3 to_rotate, bool clockwise) {
    // rotation matrix 
    mat3 rot;

    if (clockwise) {
      // clockwise rotation matrix
      rot = mat3(
        cos(degrees), -sin(degrees), 0.0,
        sin(degrees), cos(degrees), 0.0,
        0.0, 0.0, 1.0
      );
    } else {
      // counter clockwise rotation matrix
      rot = mat3(
        cos(degrees), sin(degrees), 0.0,
        -sin(degrees), cos(degrees), 0.0,
        0.0, 0.0, 1.0
      );
    } // end if

    return  rot * to_rotate;
  } // end method
  `

/* OPTIONAL: entire library of transformation functions together */

const library = `${library_tag}
  ${rotation}
  ${translation}
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
    // gl_Position = vec4(rotate(uTime, aPosition, true), 1.0);

    vec3 trans = translate(0.5, 1.0, vec3(aPosition.x, aPosition.y, 1.0));

    gl_Position = vec4(trans.x, trans.y, aPosition.z, 1.0);
    vColor = aColor;
  }
  `