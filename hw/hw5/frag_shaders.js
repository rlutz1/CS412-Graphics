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
 * phong but with flat
 * https://stackoverflow.com/questions/27581271/flat-qualifier-in-glsl
 * https://wikis.khronos.org/opengl/Primitive#Provoking_vertex
 * allow opengl to pick the vertex from the provoking vertex of the
 * primitive (our case, 1st vertex of the triangle.)
 */
const flat_frag_shader = {
  "src": `#version 300 es
    precision mediump float;

    // struct to hold light parameters 
    struct LightParams {
      vec3 ka;
      vec3 kd;
      vec3 ks;
      float alpha;
      float transparency;
    };

    uniform LightParams uLightParams;

    in vec3 vPosition;
    flat in vec3 vNormal;
    in vec3 vColor;

    // TODO: list of light positions
    uniform vec3 uPointLights; // light position in space

    out vec4 fragColor;

    void main() {
      vec3 N = normalize(vNormal); // ensure normalized
      vec3 L = normalize(uPointLights - vPosition); // get l as vector from this point
      vec3 V = normalize(-vPosition); // camera sits at the origin
      vec3 R = reflect(-L, N); // r = 2(dot(n, l) * n - l) 

      float diff = max(dot(N, L), 0.0); // diffuse max
      float spec = pow(max(dot(V, R), 0.0), uLightParams.alpha); // specular max and power alpha

      fragColor = vec4(
        (uLightParams.ka * vColor) + 
        (uLightParams.kd * vColor) * diff + 
        (uLightParams.ks * vColor) * spec, 
        uLightParams.transparency
        );
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

    // struct to hold light parameters 
    struct LightParams {
      vec3 ka;
      vec3 kd;
      vec3 ks;
      float alpha;
      float transparency;
    };

    uniform LightParams uLightParams;
    
    in vec3 vColor;

    out vec4 fragColor;

    void main() {
      fragColor = vec4(vColor, uLightParams.transparency);
    }
  `
}

// todo: may need diff shaders for different kind of shading/reflection.
const phong_frag_shader = {
  "src": `#version 300 es
    precision mediump float;

    // struct to hold light parameters 
    struct LightParams {
      vec3 ka;
      vec3 kd;
      vec3 ks;
      float alpha;
      float transparency;
    };

    uniform LightParams uLightParams;

    in vec3 vPosition;
    in vec3 vNormal;
    in vec3 vColor;

    // TODO: list of light positions
    uniform vec3 uPointLights; // light position in space

    out vec4 fragColor;

    void main() {
      vec3 N = normalize(vNormal); // ensure normalized
      vec3 L = normalize(uPointLights - vPosition); // get l as vector from this point
      vec3 V = normalize(-vPosition); // camera sits at the origin
      vec3 R = reflect(-L, N); // r = 2(dot(n, l) * n - l) 

      float diff = max(dot(N, L), 0.0); // diffuse max
      float spec = pow(max(dot(V, R), 0.0), uLightParams.alpha); // specular max and power alpha

      fragColor = vec4(
        (uLightParams.ka * vColor) + 
        (uLightParams.kd * vColor) * diff + 
        (uLightParams.ks * vColor) * spec, 
        uLightParams.transparency
        );
    }
  `
};