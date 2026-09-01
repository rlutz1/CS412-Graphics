# HW 1 instructions

1. Download both files, open hw1.html in your browser and see if you can see a triangle on the canvas.

2. **Modify the shape**. Experiment with the shape and color defined in **triangle.js** (1 pt).

3. **Modify the vertex and fragment shaders**. Use the uniform variable uTime to animate your triangle (or anything you want to create). You can make its color/transparency shift over time, change the shape dynamically, or add any other animation you can imagine. The key is to use your creativity to drive visual effects and bring the stationary content to life. (2 pts)


## some messing around

silly color swapping:

```
#version 300 es
  precision mediump float;
  in vec3 vColor;
  uniform float uTime; //time in sec

  out vec4 fragColor;

  float pos(float uTime) {
    return 0.5;
  }

  float neg(float uTime) {
    return 1.0;
  }

  void main() {
    
    float mult = 0.0;

    if (sin(uTime * 10.0) > 0.0) {
      mult = pos(uTime);
    } else {
      mult = neg(uTime);
    }

    fragColor = vec4(vColor * mult, 1.0);
  }
  
```