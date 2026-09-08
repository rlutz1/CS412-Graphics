/*
  this file contains the modular forms of transformation functions.
  they may be referenced by their names from the top level "function" dictionary.

  these can be compiled as shaders, treated as library functions for use in the 
  main object affine transformations.
 */


// rotation by d degrees function.
// TODO: specify directionality. (clockwise...)
const rotation = `#version 300 es
  precision mediump float;


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