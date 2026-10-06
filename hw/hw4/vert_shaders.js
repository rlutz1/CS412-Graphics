/**
 * file to encap the either static grab or dynamic
 * generation of vertex shaders for different nodes.
 * 
 * this is kept as a json--will be fleshing this idea out more later.
 */

const basic_vert_shader = {
  // TODO
  // "ins": ["aPosition", "aColor"],
  // "uniforms": ["uProjectionMatrix", "uModelViewMatrix", "uModelTransformationMatrix"],
  // "projection": "uProjectionMatrix", 
  // "model_view": "uModelViewMatrix",
  "src": `#version 300 es
    in vec3 aPosition;
    in vec3 aColor;

    // uniform float uTime; //time in sec
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    
    // allow for many matrices in a row
    uniform mat4 uModelTransformationMatrix[50];
    uniform int transforms_up_to; // marker of how many transforms

    //uniform int depth; // depth?
    
    out vec3 vColor;

    void main() {
      // uProjectionMatrix * uModelViewMatrix * uModelTransformationMatrix * vec4(aPosition,1.0);
      vec4 pos = vec4(aPosition, 1.0);

      for (int i = 0; i < transforms_up_to; i++) {
        pos = uModelTransformationMatrix[i] * pos; // add all transforms
      } // end loop

      gl_Position =  uProjectionMatrix * uModelViewMatrix * pos;
      
      vColor = aColor;
    }
  `
}