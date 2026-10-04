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
    in int transforms_up_to; // apply these many transforms
    
    out vec3 vColor;

    void main() {
      mat4 all_transforms = uProjectionMatrix * uModelViewMatrix;

      for (int i = 0; i < transforms_up_to; i++) {
        all_transforms *= uModelTransformationMatrix[i]; // add all transforms
      } // end loop
      gl_Position =  all_transforms * vec4(aPosition,1.0);
      
      vColor = aColor;
    }
  `
}