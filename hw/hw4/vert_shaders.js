/**
 * file to encap the either static grab or dynamic
 * generation of vertex shaders for different nodes.
 */

const basic_vert_shader = {
  "ins": ["aPosition", "aColor"],
  "uniforms": ["uProjectionMatrix", "uModelViewMatrix", "uModelTransformationMatrix"],
  "projection": "uProjectionMatrix", 
  "model_view": "uModelViewMatrix",
  "src": `#version 300 es
    in vec3 aPosition;
    in vec3 aColor;

    // uniform float uTime; //time in sec
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    //uniform mat4 uModelTransformationMatrix;
    
    // allow for many matrices in a row
    uniform mat4 uModelTransformationMatrix[50];
    uniform int transforms_up_to; // marker of how many transforms
    uniform mat4 parts_transforms[20]; // specific to the part
    uniform int parts_transforms_up_to;
    
    out vec3 vColor;

    void main() {
      vec4 pos = vec4(aPosition,1.0);

      for (int i = 0; i < parts_transforms_up_to; i++) {
        pos = parts_transforms[i] * pos; // add all transforms
      } // end loop
      
      for (int i = 0; i < transforms_up_to; i++) {
        pos = uModelTransformationMatrix[i] * pos; // add all transforms
      } // end loop
      
      gl_Position =  uProjectionMatrix * uModelViewMatrix * pos;
      
      vColor = aColor;
    }
  `
}