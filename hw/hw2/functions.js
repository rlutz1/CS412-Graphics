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

/* HELPER FUNCTIONS */
const deg_to_rad = `/* degree to radian helper */
  float deg_to_rad(float degrees) {
    return degrees * (3.14159 / 180.0);
  } // end method
  `

/* TRANSLATION FUNCTION */
const translation = `/* translate 3 element vector by tx, ty */
  vec3 translate(float tx, float ty, vec3 to_translate) {
    // transform in such a way to carry out a point translation
    vec3 to_translate_transformed = vec3(to_translate.x, to_translate.y, 1.0);

    // translation matrix
    mat3 trans = mat3(
    1.0, 0.0, 0.0,  
    0.0, 1.0, 0.0,
     tx,  ty, 1.0 
    );

    // conduct the translation
    vec3 translated = trans * to_translate_transformed;

    // return with the original third dimension
    return vec3(translated.x, translated.y, to_translate.z);
  } // end method
  `

/* SCALING FUNCTION */
const scaling = `/* scale a 3 element vector by factors sx, sy */
  vec3 scale(float sx, float sy, vec3 to_scale) {
    // scaling matrix
    mat3 scale = mat3(
       sx, 0.0, 0.0,  
      0.0,  sy, 0.0,
      0.0, 0.0, 1.0
    );

    return scale * to_scale;
  } // end method
  `

/* ROTATION FUNCTIONS */
const rotation = `/* rotate a 3 element vector in a given direction */
  vec3 rotate(float radians, vec3 to_rotate, bool clockwise) {
    // rotation matrix 
    mat3 rot;

    if (clockwise) {
      // clockwise rotation matrix
      rot = mat3(
        cos(radians), -sin(radians), 0.0,
        sin(radians), cos(radians), 0.0,
        0.0, 0.0, 1.0
      );
    } else {
      // counter clockwise rotation matrix
      rot = mat3(
        cos(radians), sin(radians), 0.0,
        -sin(radians), cos(radians), 0.0,
        0.0, 0.0, 1.0
      );
    } // end if

    return  rot * to_rotate;
  } // end method
  `

/* REFLECTION FUNCTIONS */
const reflection = `/* reflect a shape by d radians */
  vec3 reflection(float radians, vec3 to_reflect) {
    float two_theta = 2.0 * radians; // for ease of computation below

    // reflection matrix
    mat3 refl = mat3(
      cos(two_theta),  sin(two_theta), 0.0,
      sin(two_theta), -cos(two_theta), 0.0,
                 0.0,             0.0, 1.0
    );

    return refl * to_reflect;
  } // end method

  /* reflect a shape over the x axis, convenience */
  vec3 reflection_x_axis(vec3 to_reflect) {
    return reflection(deg_to_rad(0.0), to_reflect);
  } // end method

  /* reflect a shape over the y axis, convenience */
  vec3 reflection_y_axis(vec3 to_reflect) {
    return reflection(deg_to_rad(90.0), to_reflect);
  } // end method

  /* reflect a shape over the y=x axis, convenience */
  vec3 reflection_yx_axis(vec3 to_reflect) {
    return reflection(deg_to_rad(45.0), to_reflect);
  } // end method
  `
/* SHEAR/SKEW FUNCTIONS */
const shearing = `/* shear/skew a shape by shx, shy */
  vec3 shear(float shx, float shy, vec3 to_shear) {
    mat3 sh = mat3(
      1.0, shy, 0.0,
      shx, 1.0, 0.0,
      0.0, 0.0, 1.0
    );

    return sh * to_shear;
  } // end method
  `

/* OPTIONAL: entire library of transformation functions together */
const library = `${library_tag}
  ${deg_to_rad}
  ${translation}
  ${scaling}
  ${rotation}
  ${reflection}
  ${shearing}
  `

/* VERT SHADER USED BY DEFAULT */
const vert_shader = `${medium_p_header}
  ${library}
  ${main_tag}
  in vec3 aPosition;
  in vec3 aColor;

  vec3 pt = vec3(-0.3, 0.2, 0.0); // point to rotate around, arbitrary
  
  uniform float uTime; //time in sec
  out vec3 vColor;

  /* transform the shape with the usual TRS pattern */
  vec3 transform_combination(vec3 to_transform) {
    vec3 transformed = to_transform; // for ease of stacking

    transformed = translate(-pt.x, -pt.y, transformed); // shift so point is origin
    transformed = rotate(uTime, transformed, true); // rotate
    transformed = shear(0.5, 0.5, transformed); // shear
    transformed = translate(pt.x, pt.y, transformed); // shift back

    return transformed;
  } // end method

  void main() {
    // final transformation combining multiple changes.
    gl_Position = vec4(transform_combination(aPosition), 1.0);

    vColor = aColor;
  }
  `