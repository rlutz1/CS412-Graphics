/**
 * file to encap the either static grab or dynamic
 * generation of vertex shaders for different nodes.
 * 
 * this is kept as a json -- will be fleshing out more later.
 */

const basic_frag_shader = {
  "src": `#version 300 es
    precision mediump float;
    in vec3 vColor;

    out vec4 fragColor;

    void main() {
      fragColor = vec4(vColor,1.0);
    }
  `
}

// todo: may need diff shaders for different kind of shading/reflection.
const lighting_frag_shader = {
  "src": `#version 300 es
    precision mediump float;

    in vec3 vPosition;
    in vec3 vNormal;
    in vec3 vColor;

    // TODO: list of light positions
    uniform vec3 uPointLights; // light position in space

    out vec4 fragColor;

    void main() {
      vec3 Ka = 0.2 * uColor;
      vec3 Kd = 0.8 * uColor;
      vec3 Ks = vec3(0.5);
      float shininess = 32.0;

      vec3 N = normalize(vNormal);
      vec3 L = normalize(uLightPos - vPosition);
      vec3 V = normalize(-vPosition);           // camera sits at the origin
      vec3 R = reflect(-L, N);

      float diff = max(dot(N, L), 0.0);
      float spec = pow(max(dot(V, R), 0.0), shininess);

      fragColor = vec4(Ka + Kd * diff + Ks * spec, 1.0);
    }
  `
};