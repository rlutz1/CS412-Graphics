const BASIC = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform int u_maxBounces;
uniform float u_ambientStrength; //Ambient fill light for better visual
uniform vec2 u_cameraOrbit;

out vec4 fragColor;

const float LIGHT_POWER = 3.0;
const float FLOOR_Y = -2.0;
const float CHECKER_SIZE = 3.0;
const float GLASS_IOR = 1.5;  // refractive index of the glass sphere
const float REFLECT_PROB = 0.7;

struct Ray {
    vec3 origin;
    vec3 direction;
};

struct Sphere {
    vec3 center;
    float radius;
    vec3 color;
};

struct Cube {
    vec3 center;
    float halfSize;
    vec3 color;
    float reflectivity;
};

struct HitData {
    bool hit;
    float t;
    vec3 point;
    vec3 normal;
    vec3 color;
    float reflectivity;
    bool isLight;
    bool isGlass;
};

const Sphere lightSphere = Sphere(vec3(4.0, 3.0, -4.0), 0.3, vec3(1.0, 1.0, 0.9));
Sphere sphere;
Sphere glassSphere;
Cube cube;

void initScene(float time) {
    float a = time * 0.5;
    sphere = Sphere(vec3(cos(a) * 2.5, sin(a * 1.3) * 0.8, -6.0 + sin(a) * 0.5), 0.5, vec3(1.0, 0.3, 0.3));

    float c = time * 0.7;
    glassSphere = Sphere(vec3(sin(c), cos(c), -5), 1.0, vec3(1.0, 0.3, 0.3));

    float b = time * 0.3;
    cube = Cube(vec3(sin(b) * 2.0, cos(b * 1.5) + 0.5, -9.0 + cos(b * 0.7)), 0.8, vec3(0.3, 0.8, 0.3), 0.85);
}

bool intersectSphere(Ray ray, Sphere s, out float t) {
    vec3 oc = ray.origin - s.center;
    float b = dot(oc, ray.direction);
    float d = b * b - dot(oc, oc) + s.radius * s.radius;
    if (d < 0.0) return false;

    t = -b - sqrt(d);
    if (t < 0.001) t = -b + sqrt(d);  // ray starts inside
    return t > 0.001;
}

// Slab test
bool intersectCube(Ray ray, out float t, out vec3 normal) {
    vec3 t0s = (cube.center - cube.halfSize - ray.origin) / ray.direction;
    vec3 t1s = (cube.center + cube.halfSize - ray.origin) / ray.direction;
    vec3 tmin = min(t0s, t1s);
    vec3 tmax = max(t0s, t1s);
    float t0 = max(max(tmin.x, tmin.y), tmin.z);
    float t1 = min(min(tmax.x, tmax.y), tmax.z);
    if (t1 < 0.0 || t0 > t1) return false;

    t = t0 > 0.001 ? t0 : t1;
    if (t < 0.001) return false;

    vec3 local = ray.origin + ray.direction * t - cube.center;
    vec3 a = abs(local);
    if (a.x > a.y && a.x > a.z) normal = vec3(sign(local.x), 0.0, 0.0);
    else if (a.y > a.z) normal = vec3(0.0, sign(local.y), 0.0);
    else normal = vec3(0.0, 0.0, sign(local.z));
    return true;
}

// I: incoming ray
// N: surface normal
// eta: n1 / n2
vec3 refraction(vec3 I, vec3 N, float eta) {
  I = normalize(I); N = normalize(N); // ensure normalization
  vec3 T;

  // calculate the refraction -- k >= 0 -> light passes through
  // k < 0 -> no refraction
  float k = 1.0 - eta * eta * (1.0 - dot(N, I) * dot(N, I));
  
  if (k < 0.0) {
    T = vec3(0.0); // just return 0 vec
  } else {
    // otherwise, light passes through the medium. 
    // calculate the refraction vector.
    T = eta * I - (eta * dot(N, I) + sqrt(k)) * N;
  } // end if
      
  return T;
  // return refract(I, N, eta); // built in does above
} // end function

// Schlick approximation for fresnel equation
float schlick(float eta, vec3 n, vec3 v) {
  n = normalize(n); v = normalize(v); // normalize just in case
  float f0 = (1.0 - eta) / (1.0 + eta);
  f0 = f0 * f0;

  float cosine = clamp(dot(n, v), 0.0, 1.0);

  return f0 + (1.0 - f0) * pow(1.0 - cosine, 5.0);
} // end function

bool intersectFloor(Ray ray, out float t) {
    if (abs(ray.direction.y) < 0.0001) return false;
    t = (FLOOR_Y - ray.origin.y) / ray.direction.y;
    return t > 0.001;
}

HitData traceScene(Ray ray, bool includeLight) {
    HitData hit;
    hit.hit = false; // not hit presumed
    hit.t = 1e10; // large arbitrary number
    float t; // distance of origin to point on ray
    vec3 n; // normal at this frag

    // tracing with the lightbulb around
    if (includeLight && intersectSphere(ray, lightSphere, t) && t < hit.t) {
        hit = HitData(true, t, ray.origin + ray.direction * t, vec3(0.0), lightSphere.color, 0.0, true, false);
    }

    if (intersectFloor(ray, t) && t < hit.t) {
        vec3 p = ray.origin + ray.direction * t;
        vec2 cell = floor(p.xz / CHECKER_SIZE);
        vec3 color = mod(cell.x + cell.y, 2.0) < 1.0 ? vec3(1.0) : vec3(0.05);
        hit = HitData(true, t, p, vec3(0.0, 1.0, 0.0), color, 0.0, false, false);
    }

    if (intersectCube(ray, t, n) && t < hit.t) {
        hit = HitData(true, t, ray.origin + ray.direction * t, n, cube.color, cube.reflectivity, false, false);
    }

    if (intersectSphere(ray, sphere, t) && t < hit.t) {
        vec3 p = ray.origin + ray.direction * t;
        hit = HitData(true, t, p, (p - sphere.center) / sphere.radius, sphere.color, 0.0, false, false);
    }

    // adding the test for the glass sphere.
    if (intersectSphere(ray, glassSphere, t) && t < hit.t) {
        vec3 p = ray.origin + ray.direction * t;
        // return information for glass sphere, isGlass -> true
        hit = HitData(true, t, p, (p - glassSphere.center) / glassSphere.radius, glassSphere.color, 0.0, false, true);
    }

    return hit;
}

vec3 trace(Ray ray) {
    vec3 color = vec3(0.0); 
    vec3 attenuation = vec3(1.0);

    // use loop to simulate the recursive process as GLSL doesn't support recursions
    for (int bounce = 0; bounce < u_maxBounces; bounce++) {
        HitData hit = traceScene(ray, true);

        if (!hit.hit) {
            float t = 0.5 * (ray.direction.y + 1.0);
            // linear interpolation of those two values... -> mix, interp with value t
            color += attenuation * mix(vec3(0.09, 0.12, 0.18), vec3(0.18, 0.21, 0.27), t);  // sky
            break;
        }

        if (hit.isLight) {
            color += attenuation * lightSphere.color * LIGHT_POWER;
            break;
        }

        // Refraction: (option 1)either reflects or refracts the ray, whichever Schlick says is stronger
        // (option 2): finalColor = hit.color * (F * reflectionColor + (1.0 - F) * refractionColor)
        // (option 3): Monte Carlo Sampling (multiple rays per pixel), reflect with probability F (random() < schlick_value), else refract, and average many samples per pixel
       
        // if we hit a glass object (glassSphere)
        if (hit.isGlass) {
          // see if ray is entering or exiting the glass.
          // if ray is exiting, the direction widens, on entering, the direction narrows.
          // this can be represented by changing the index of refraction proportion.
          vec3 N = hit.normal;
          float eta = 1.0 / GLASS_IOR; // assume entering

          // if the ray is exiting the glass
          // TODO: more on this, confused.
          if (dot(ray.direction, N) > 0.0) {
              N = -N;
              eta = GLASS_IOR;
          } // end if

          // get the refraction vector
          vec3 refracted = refraction(ray.direction, N, eta);
          vec3 reflected = reflect(normalize(ray.direction), normalize(N));

          // if zero vector returned, assume total internal reflection
          bool total_internal_reflection = dot(refracted, refracted) < 0.0001;

          // calculate the schlick value, aligning ray with N regardless of entering, exiting
          float schlick_value = schlick(1.0 / GLASS_IOR, N, -ray.direction);
      
          vec3 direction;

          if (total_internal_reflection || schlick_value > REFLECT_PROB) {
              direction = reflected;
          } else {
              direction = refracted;
          } // end if

          ray = Ray(hit.point + direction * 0.001, direction);

          // TODO: Use Schlick approximation to determine contributions from reflection and refraction
          attenuation *= vec3(1.0);
          continue;
        }

        vec3 toLight = lightSphere.center - hit.point;
        float lightDist = length(toLight);
        vec3 lightDir = toLight / lightDist;

        HitData blocker = traceScene(Ray(hit.point + hit.normal * 0.001, lightDir), false);
        float visible = blocker.hit && blocker.t < lightDist ? 0.0 : 1.0;
        float diff = max(dot(hit.normal, lightDir), 0.0);
        float falloff = 1.0 / (1.0 + 0.1 * lightDist * lightDist);

        //  (optional) Ambient fill light approximates indirect light we don't trace.
        vec3 shading = hit.color * (LIGHT_POWER * diff * falloff * visible + u_ambientStrength);
        color += attenuation * shading * (1.0 - hit.reflectivity);

        if (hit.reflectivity == 0.0) break;
        attenuation *= hit.reflectivity;
        ray = Ray(hit.point + hit.normal * 0.001, reflect(ray.direction, hit.normal));
    }

    return color;
}

void main() {
    initScene(u_time);

    // Orbit camera around the scene center
    float cp = cos(u_cameraOrbit.x), sp = sin(u_cameraOrbit.x);
    float cy = cos(u_cameraOrbit.y), sy = sin(u_cameraOrbit.y);
    mat3 rotX = mat3(1.0, 0.0, 0.0,  0.0, cp, -sp,  0.0, sp, cp);
    mat3 rotY = mat3(cy, 0.0, -sy,  0.0, 1.0, 0.0,  sy, 0.0, cy);
    mat3 camera = rotY * rotX;

    vec3 target = vec3(0.0, 0.0, -5.0);
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    Ray ray = Ray(target + camera * vec3(0.0, 0.0, 7.0), camera * normalize(vec3(uv, -1.5)));

    fragColor = vec4(pow(trace(ray), vec3(1.0 / 2.2)), 1.0);  // gamma correction
}`


const MONTE = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform int u_maxBounces;
uniform float u_ambientStrength; //Ambient fill light for better visual
uniform vec2 u_cameraOrbit;

out vec4 fragColor;

const float LIGHT_POWER = 3.0;
const float FLOOR_Y = -2.0;
const float CHECKER_SIZE = 3.0;
const float GLASS_IOR = 1.5;  // refractive index of the glass sphere
const float REFLECT_PROB = 0.7; // for monte carlo choice

struct Ray {
    vec3 origin;
    vec3 direction;
};

struct Sphere {
    vec3 center;
    float radius;
    vec3 color;
};

struct Cube {
    vec3 center;
    float halfSize;
    vec3 color;
    float reflectivity;
};

struct HitData {
    bool hit;
    float t;
    vec3 point;
    vec3 normal;
    vec3 color;
    float reflectivity;
    bool isLight;
    bool isGlass;
};

const Sphere lightSphere = Sphere(vec3(4.0, 3.0, -4.0), 0.3, vec3(1.0, 1.0, 0.9));
Sphere sphere;
Sphere glassSphere;
Cube cube;

void initScene(float time) {
    float a = time * 0.5;
    sphere = Sphere(vec3(cos(a) * 2.5, sin(a * 1.3) * 0.8, -6.0 + sin(a) * 0.5), 0.5, vec3(1.0, 0.3, 0.3));

    float c = time * 0.7;
    glassSphere = Sphere(vec3(sin(c), cos(c), -5), 1.0, vec3(1.0, 0.3, 0.3));

    float b = time * 0.3;
    cube = Cube(vec3(sin(b) * 2.0, cos(b * 1.5) + 0.5, -9.0 + cos(b * 0.7)), 0.8, vec3(0.3, 0.8, 0.3), 0.85);
}

bool intersectSphere(Ray ray, Sphere s, out float t) {
    vec3 oc = ray.origin - s.center;
    float b = dot(oc, ray.direction);
    float d = b * b - dot(oc, oc) + s.radius * s.radius;
    if (d < 0.0) return false;

    t = -b - sqrt(d);
    if (t < 0.001) t = -b + sqrt(d);  // ray starts inside
    return t > 0.001;
}

// Slab test
bool intersectCube(Ray ray, out float t, out vec3 normal) {
    vec3 t0s = (cube.center - cube.halfSize - ray.origin) / ray.direction;
    vec3 t1s = (cube.center + cube.halfSize - ray.origin) / ray.direction;
    vec3 tmin = min(t0s, t1s);
    vec3 tmax = max(t0s, t1s);
    float t0 = max(max(tmin.x, tmin.y), tmin.z);
    float t1 = min(min(tmax.x, tmax.y), tmax.z);
    if (t1 < 0.0 || t0 > t1) return false;

    t = t0 > 0.001 ? t0 : t1;
    if (t < 0.001) return false;

    vec3 local = ray.origin + ray.direction * t - cube.center;
    vec3 a = abs(local);
    if (a.x > a.y && a.x > a.z) normal = vec3(sign(local.x), 0.0, 0.0);
    else if (a.y > a.z) normal = vec3(0.0, sign(local.y), 0.0);
    else normal = vec3(0.0, 0.0, sign(local.z));
    return true;
}

// I: incoming ray
// N: surface normal
// eta: n1 / n2
vec3 refraction(vec3 I, vec3 N, float eta) {
  I = normalize(I); N = normalize(N); // ensure normalization
  vec3 T;

  // calculate the refraction -- k >= 0 -> light passes through
  // k < 0 -> no refraction
  float k = 1.0 - eta * eta * (1.0 - dot(N, I) * dot(N, I));
  
  if (k < 0.0) {
    T = vec3(0.0); // just return 0 vec
  } else {
    // otherwise, light passes through the medium. 
    // calculate the refraction vector.
    T = eta * I - (eta * dot(N, I) + sqrt(k)) * N;
  } // end if
      
  return T;
  // return refract(I, N, eta); // built in does above
} // end function

// Schlick approximation for fresnel equation
float schlick(float eta, vec3 n, vec3 v) {
  n = normalize(n); v = normalize(v); // normalize just in case
  float f0 = (1.0 - eta) / (1.0 + eta);
  f0 = f0 * f0;

  float cosine = clamp(dot(n, v), 0.0, 1.0);

  return f0 + (1.0 - f0) * pow(1.0 - cosine, 5.0);
} // end function

// really silly random function.
// https://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
float random(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
} // end function


bool intersectFloor(Ray ray, out float t) {
    if (abs(ray.direction.y) < 0.0001) return false;
    t = (FLOOR_Y - ray.origin.y) / ray.direction.y;
    return t > 0.001;
}

HitData traceScene(Ray ray, bool includeLight) {
    HitData hit;
    hit.hit = false; // not hit presumed
    hit.t = 1e10; // large arbitrary number
    float t; // distance of origin to point on ray
    vec3 n; // normal at this frag

    // tracing with the lightbulb around
    if (includeLight && intersectSphere(ray, lightSphere, t) && t < hit.t) {
        hit = HitData(true, t, ray.origin + ray.direction * t, vec3(0.0), lightSphere.color, 0.0, true, false);
    }

    if (intersectFloor(ray, t) && t < hit.t) {
        vec3 p = ray.origin + ray.direction * t;
        vec2 cell = floor(p.xz / CHECKER_SIZE);
        vec3 color = mod(cell.x + cell.y, 2.0) < 1.0 ? vec3(1.0) : vec3(0.05);
        hit = HitData(true, t, p, vec3(0.0, 1.0, 0.0), color, 0.0, false, false);
    }

    if (intersectCube(ray, t, n) && t < hit.t) {
        hit = HitData(true, t, ray.origin + ray.direction * t, n, cube.color, cube.reflectivity, false, false);
    }

    if (intersectSphere(ray, sphere, t) && t < hit.t) {
        vec3 p = ray.origin + ray.direction * t;
        hit = HitData(true, t, p, (p - sphere.center) / sphere.radius, sphere.color, 0.0, false, false);
    }

    // adding the test for the glass sphere.
    if (intersectSphere(ray, glassSphere, t) && t < hit.t) {
        vec3 p = ray.origin + ray.direction * t;
        // return information for glass sphere, isGlass -> true
        hit = HitData(true, t, p, (p - glassSphere.center) / glassSphere.radius, glassSphere.color, 0.0, false, true);
    }

    return hit;
}

vec3 trace(Ray ray) {
    vec3 color = vec3(0.0); 
    vec3 attenuation = vec3(1.0);

    // use loop to simulate the recursive process as GLSL doesn't support recursions
    for (int bounce = 0; bounce < u_maxBounces; bounce++) {
        HitData hit = traceScene(ray, true);

        if (!hit.hit) {
            float t = 0.5 * (ray.direction.y + 1.0);
            // linear interpolation of those two values... -> mix, interp with value t
            color += attenuation * mix(vec3(0.09, 0.12, 0.18), vec3(0.18, 0.21, 0.27), t);  // sky
            break;
        }

        if (hit.isLight) {
            color += attenuation * lightSphere.color * LIGHT_POWER;
            break;
        }

        // Refraction: (option 1)either reflects or refracts the ray, whichever Schlick says is stronger
        // (option 2): finalColor = hit.color * (F * reflectionColor + (1.0 - F) * refractionColor)
        // (option 3): Monte Carlo Sampling (multiple rays per pixel), reflect with probability F (random() < schlick_value), else refract, and average many samples per pixel
       
        // if we hit a glass object (glassSphere)
        if (hit.isGlass) {
          // see if ray is entering or exiting the glass.
          // if ray is exiting, the direction widens, on entering, the direction narrows.
          // this can be represented by changing the index of refraction proportion.
          vec3 N = hit.normal;
          float eta = 1.0 / GLASS_IOR; // assume entering

          // if the ray is exiting the glass
          // TODO: more on this, confused.
          if (dot(ray.direction, N) > 0.0) {
              N = -N;
              eta = GLASS_IOR;
          } // end if

          // get the refraction vector
          vec3 refracted = refraction(ray.direction, N, eta);
          vec3 reflected = reflect(normalize(ray.direction), normalize(N));

          // if zero vector returned, assume total internal reflection
          bool total_internal_reflection = dot(refracted, refracted) < 0.0001;

          // calculate the schlick value, aligning ray with N regardless of entering, exiting
          float schlick_value = schlick(1.0 / GLASS_IOR, N, -ray.direction);
      
          vec3 direction;

          // use schlick for contributes, "random" selection
          if (total_internal_reflection || random(vec2(342.0)) < schlick_value) {
              direction = reflected;
          } else {
              direction = refracted;
          } // end if

          ray = Ray(hit.point + direction * 0.001, direction);

          attenuation *= vec3(1.0);
          continue;
        }

        vec3 toLight = lightSphere.center - hit.point;
        float lightDist = length(toLight);
        vec3 lightDir = toLight / lightDist;

        HitData blocker = traceScene(Ray(hit.point + hit.normal * 0.001, lightDir), false);
        float visible = blocker.hit && blocker.t < lightDist ? 0.0 : 1.0;
        float diff = max(dot(hit.normal, lightDir), 0.0);
        float falloff = 1.0 / (1.0 + 0.1 * lightDist * lightDist);

        //  (optional) Ambient fill light approximates indirect light we don't trace.
        vec3 shading = hit.color * (LIGHT_POWER * diff * falloff * visible + u_ambientStrength);
        color += attenuation * shading * (1.0 - hit.reflectivity);

        if (hit.reflectivity == 0.0) break;
        attenuation *= hit.reflectivity;
        ray = Ray(hit.point + hit.normal * 0.001, reflect(ray.direction, hit.normal));
    }

    return color;
}

void main() {
    initScene(u_time);

    // Orbit camera around the scene center
    float cp = cos(u_cameraOrbit.x), sp = sin(u_cameraOrbit.x);
    float cy = cos(u_cameraOrbit.y), sy = sin(u_cameraOrbit.y);
    mat3 rotX = mat3(1.0, 0.0, 0.0,  0.0, cp, -sp,  0.0, sp, cp);
    mat3 rotY = mat3(cy, 0.0, -sy,  0.0, 1.0, 0.0,  sy, 0.0, cy);
    mat3 camera = rotY * rotX;

    vec3 target = vec3(0.0, 0.0, -5.0);
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    Ray ray = Ray(target + camera * vec3(0.0, 0.0, 7.0), camera * normalize(vec3(uv, -1.5)));

    fragColor = vec4(pow(trace(ray), vec3(1.0 / 2.2)), 1.0);  // gamma correction
}`