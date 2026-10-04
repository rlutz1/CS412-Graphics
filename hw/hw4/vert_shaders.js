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
      mat4 all_transforms = uProjectionMatrix * uModelViewMatrix;

      for (int i = 0; i < transforms_up_to; i++) {
        all_transforms *= uModelTransformationMatrix[i]; // add all transforms
      } // end loop

      for (int i = 0; i < parts_transforms_up_to; i++) {
        all_transforms *= parts_transforms[i]; // add all transforms
      } // end loop

      gl_Position =  all_transforms * vec4(aPosition,1.0);
      
      vColor = aColor;
    }
  `
}