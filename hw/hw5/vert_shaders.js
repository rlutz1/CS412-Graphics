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

      gl_Position = uProjectionMatrix * uModelViewMatrix * pos;
      // address some clipping while using an orthographic projection:
      // https://stackoverflow.com/questions/66405678/othographic-projection-causing-geometry-to-get-clipped-by-the-far-plane
      gl_Position.z *= 0.5;
      
      vColor = aColor;
    }
  `
}

// todo: may need diff shaders for different kind of shading/reflection.
const lighting_vert_shader = {
  "src": `#version 300 es

    in vec3 aPosition;
    in vec3 aNormal;
    in vec3 aColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    // allow for many matrices in a row
    uniform mat4 uModelTransformationMatrix[50];
    uniform int transforms_up_to; // marker of how many transforms

    out vec3 vPosition;
    out vec3 vNormal;
    out vec3 vColor;

    void main() {
      // cast for transformations to a 4d vect
      vec4 pos = vec4(aPosition, 1.0);

      for (int i = 0; i < transforms_up_to; i++) {
        pos = uModelTransformationMatrix[i] * pos; // add all transforms
      } // end loop

      // save the position of this vertex prior to projection -- send to frag.
      vec4 p = uModelViewMatrix * pos;
      // vec4 p = uProjectionMatrix * uModelViewMatrix * pos;
      vPosition = p.xyz;
      // vPosition.z *= 0.5;
      // use model view and apply to given normal -- send to frag.
      vNormal = mat3(uModelViewMatrix) * aNormal;

      // set the actual positioning in the projection
      gl_Position = uProjectionMatrix * p;
      // gl_Position = p;
      // address some clipping while using an orthographic projection:
      // https://stackoverflow.com/questions/66405678/othographic-projection-causing-geometry-to-get-clipped-by-the-far-plane
      gl_Position.z *= 0.5;

      vColor = aColor; // send out the vertex color to frag shader
    }
  `
};