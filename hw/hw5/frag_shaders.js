/**
 * file to encap the either static grab or dynamic
 * generation of vertex shaders for different nodes.
 * 
 * this is kept as a json -- will be fleshing out more later.
 */

/**
 * most basic frag shader to use.
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

/**
 * basic frag shader, but named
 * for clarity in use.
 */
const gouraud_frag_shader = {
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
const phong_frag_shader = {
  "src": `#version 300 es
    precision mediump float;

    in vec3 vPosition;
    in vec3 vNormal;
    in vec3 vColor;

    // TODO: list of light positions
    uniform vec3 uPointLights; // light position in space

    out vec4 fragColor;

    void main() {
      vec3 Ka = 0.2 * vColor;
      vec3 Kd = 0.8 * vColor;
      vec3 Ks = vec3(0.5);
      float shininess = 32.0;

      vec3 N = normalize(vNormal); // ensure normalized
      vec3 L = normalize(uPointLights - vPosition); // get l as vector from this point
      vec3 V = normalize(-vPosition); // camera sits at the origin
      vec3 R = reflect(-L, N); // r = 2(dot(n, l) * n - l) 

      float diff = max(dot(N, L), 0.0); // diffuse max
      float spec = pow(max(dot(V, R), 0.0), shininess); // specular max and power alpha

      fragColor = vec4(Ka + Kd * diff + Ks * spec, 1.0);
    }
  `
};