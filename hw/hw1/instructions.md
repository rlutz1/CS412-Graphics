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


+ making a change in either vertex shader or frag shader changes the color of a vertex. is it possible to make change to just one though?
+ change to frag color makes changes on all vertices

wait a minute.

this changes the top and bottom left corners
```
fragColor = vec4(vColor.r * cos(uTime), vColor.g, vColor.b * cos(uTime), 1.0);
```

so this in vertex shader

```
vColor = vec3(aColor.r, aColor.g * sin(uTime), aColor.b * sin(uTime));
```

intersting thing is that adding the .g manipulation caused:
1. bottom left vertex to pulse where it had not before
2. the green tint to be back in the bottom right corner where it was only hella blue

the reason for this, just confirmed by adding a blue value to the bottom left corner and remving the .g manip: **the .b manip affects all vertices' blue value. if there is no blue value, it will appear to be completely unaffected.**

*and changing in vertex shader or frag shader has same effect.*

what if i wanted to rotate the colors? it would feel like a 3d rotation, right?

3d rotation almost working:

```
 mat3 rot = mat3(
  1.0, 0.0, 0.0,
  0.0, cos(uTime), -sin(uTime),
  0.0, sin(uTime), cos(uTime)
);

vec3 new_color = rot * vColor;  

fragColor = vec4(new_color, 1.0);
```

change to this and we do get a decent swirl
```
 mat3 rot = mat3(
      cos(uTime), -sin(uTime), 0.0,
      sin(uTime), cos(uTime), -sin(uTime),
      0.0, sin(uTime), cos(uTime)
    );
```

also cool
```
mat3 rot = mat3(
      cos(uTime) , -sin(uTime), sin(uTime),
      sin(uTime), cos(uTime), -sin(uTime),
      -sin(uTime), sin(uTime), cos(uTime)
    );

  
```

washing machine back and forth, change to frequency
```
mat3 rot = mat3(
      cos(2.0 * uTime) , -sin(uTime), sin(uTime),
      sin(uTime), cos(2.0 * uTime), -sin(uTime),
      -sin(uTime), sin(uTime), cos(2.0 * uTime)
    );
```

changing the colors to the following changes their periods of rotation enough to get what daddy needs

```
// 
const colors = new Float32Array([
  -1.0, 1.0, 0.0,  // green -> red -> black
  1.0, 0.0, -1.0,  // red -> blue -> black
  0.0, -1.0, 1.0   // blue -> green -> black
]);
```
## old scripts

### vert
```js
 <script id="vertex-shader" type="x-shader/x-vertex">#version 300 es
  precision mediump float;
  in vec3 aPosition;
  in vec3 aColor;

  uniform float uTime; //time in sec
  out vec3 vColor;

  void main() {
    vec3 rot_y = vec3(sin(uTime), cos(uTime), 0.0);
    vec3 rot_x = vec3(-cos(uTime), sin(uTime), 0.0);    
    vec3 trans = vec3(aPosition.x - 0.0, aPosition.y - 0.0, 1.0);

    float new_x = dot(rot_x, trans);
    float new_y = dot(rot_y, trans);

    vec3 new_pos = vec3(new_x, new_y, aPosition.z);

    // vec3 something = rot * trans;
    // vec3 something = test * aPosition; 
  

    // anchors to the green point:
    // new_pos += rot_x;


    //gl_Position = vec4(new_pos, 1.0); // UNCOMMENT FOR FINAL
    gl_Position = vec4(aPosition, 1.0);
    vColor = aColor;
  }
  </script>
  ```

  ### frag


```js
 <script id="fragment-shader" type="x-shader/x-fragment">#version 300 es
  precision mediump float;
  in vec3 vColor;

  uniform float uTime; // shared time in seconds

  out vec4 fragColor;

  void main() {
    // cool effect:
    // fragColor = vec4(vColor * tan(uTime), 1.0);
    // fragColor = vec4(vColor * (1.0 / tan(uTime)), 1.0);  
    // cot(x) + tan(x) -> interesting as well
    // cool color period
    //  fragColor = vec4(vColor.x + sin(uTime), vColor.y + cos(uTime), vColor.z + sin(uTime + 3.14), 1.0); 

    // my fave: 
    // fragColor = vec4(vColor.r * sin(uTime), vColor.b * sin(uTime + 1.57), vColor.g * sin(uTime + 3.14), 1.0);

    mat3 rot = mat3(
      cos(uTime) , -sin(uTime), sin(uTime),
      sin(uTime), cos(uTime), -sin(uTime),
      -sin(uTime), sin(uTime), cos(uTime)
    );

    // not quite what i wanted
   /*
   float cos_adjusted = cos(uTime) / 2.0 + 0.5;
   float sin_adjusted = sin(uTime) / 2.0 + 0.5;

    mat3 rot = mat3(
      cos_adjusted , -sin_adjusted, sin_adjusted,
      sin_adjusted, cos_adjusted, -sin_adjusted,
      -sin_adjusted, sin_adjusted, cos_adjusted
    );
    */

    vec3 new_color = rot * vColor;  

    //fragColor = vec4(new_color, 1.0); // UNCOMMENT FOR FINAL
    fragColor = vec4(vColor, 1.0);
  }
  </script>
```