# HW 2 instructions

This assignment builds on your HW 1. You'll start from your HW 1 and give it the ability to move, rotate, resize, flip, and skew, by writing the transformation math yourself and applying it in the vertex shader.

Define each of the following 2D transformations as a **3x3 matrix** (or equivalent), and **write a function for each** (5 pts):
  1. Translation (tx, ty)
  2. Scaling (sx, sy)
  3. Rotation (angle)
  4. Mirroring/reflection (across the x-axis, y-axis, both, or anything you prefer)
  5. Shearing/skewing (shx, shy)
Animate at least two transformation continuously, for example a triangle that rotates over time, pulses in scale, or shears back and forth. You're welcome to combine more transformations in your animation (2 pts).

It is highly recommended to host your homework assignments on GitHub Pages (not required for now).

Information about hosting your working demo on GitHub Pages: if you're new to GitHub Pages, see What is GitHub Pages? for an introduction, then follow GitHub's setup guide to publish a page from your repository. Make sure your submitted link opens directly to your running project (not just the repository).

## notes

would like to do this in such a way that it is modular and can be used later.

you need to have these things in a vert shader/frag shader, right? because that's what's done to compile into a program.

what i MAY need to do is split up the program.

have like 

```
shader header + functions + main
```

and have separate strings for all functions. use concatenation as a way to modularize this.

potentially a thing you can do by compiling it as a shader:

```
Yes, you can compile functions separately in WebGL, but they cannot remain as completely independent, detached binaries like in some desktop graphics APIs. Instead, you must link them together into a single shader program before execution.
WebGL allows you to attach multiple shader objects of the same type (e.g., two vertex shaders) to a single WebGLProgram. This lets you modularize your code by putting your transformation functions in one file/string and your main logic in another.
## How to Do It (The Workflow)
To separate your transformation functions from your main shader logic, follow this structure:

   1. Create the Transformation Library: Write a shader string containing only your helper functions.
   2. Create the Main Shader: Write a shader string containing the main() function, ensuring you declare the function prototypes of the helpers you plan to use.
   3. Compile and Attach: Create separate WebGLShader objects for both, compile them, and attach both to the same WebGLProgram.

## Code Example
Here is how you implement this in JavaScript using WebGL2:

// 1. Your separate transformation function libraryconst transformLibSource = `#version 300 es
    precision highp float;
    
    // Separate transformation function
    vec4 rotatePosition(vec4 pos, float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return vec4(pos.x * c - pos.y * s, pos.x * s + pos.y * c, pos.z, pos.w);
    }
`;
// 2. Your main vertex shaderconst mainVertexSource = `#version 300 es
    in vec4 a_position;
    uniform float u_angle;
    
    // Function prototype declaration (so the compiler knows it exists)
    vec4 rotatePosition(vec4 pos, float angle);

    void main() {
        // Call the separate function
        gl_Position = rotatePosition(a_position, u_angle);
    }
`;
// 3. Compilation and Linking Setupfunction createProgram(gl) {
    // Compile the library shader
    const libShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(libShader, transformLibSource);
    gl.compileShader(libShader);

    // Compile the main shader
    const mainShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(mainShader, mainVertexSource);
    gl.compileShader(mainShader);

    // Link them together into one program
    const program = gl.createProgram();
    gl.attachShader(program, libShader);  // Attach the library
    gl.attachShader(program, mainShader); // Attach the main logic
    gl.linkProgram(program);

    return program;
}

## Important Rules to Remember

* Prototype Declarations: The shader containing main() must declare the function signatures (prototypes) of the external functions it calls, or compilation will fail.
* No Main Duplicates: Only one of the attached shaders of a specific type (vertex or fragment) can contain the void main() function.
* Global Scope: Variables declared outside functions in your library shader will be visible to the main shader, which can cause naming conflicts if you aren't careful.
* Performance: There is no performance penalty at render time for doing this. The WebGL driver links and optimizes the combined code into a single executable binary during the gl.linkProgram() step.
```

[but also: contradiction, cannot do this](https://stackoverflow.com/questions/64252651/link-with-a-functions-library-shader)

[no, think this is a thing, source](https://stackoverflow.com/questions/33615819/multiple-shaders-in-opengl)

TODO: change to return a MATRIX, not the vec3 perhaps

pulling this out

```C
// final position -- TESTING, commented for now.
// gl_Position = vec4(rotate(uTime, aPosition, true), 1.0);
// gl_Position = vec4(translate(0.5, 1.0, aPosition), 1.0);
// gl_Position = vec4(scale(1.0, 1.0, aPosition), 1.0);

// gl_Position = vec4(reflection_x_axis(aPosition), 1.0); // x axis
// gl_Position = vec4(reflection_y_axis(aPosition), 1.0); // y axis
// gl_Position = vec4(reflection_yx_axis(aPosition), 1.0); // y=x axis

// gl_Position = vec4(shear(0.0, 0.0, aPosition), 1.0);

// gl_Position = vec4(aPosition, 1.0);
```

basically what im going to submit is 
1. translate all points back to a predefined "origin" point (pt)
   + this effectively makes the defined point the new origin
2. rotate
3. shear in both x, y
4. translate back

creates an effect of a tilted triangle plane spinning around a predefined point.

## neat things only

```js
#version 300 es 
  precision mediump float;
  /*===== END HEADER ======*/
  
  /*===== LIBRARY FUNCS ======*/
  /* translate 3 element vector by tx, ty */
  vec3 translate(float tx, float ty, vec3 to_translate) {
    // transform in such a way to carry out a point translation
    vec3 to_translate_transformed = vec3(to_translate.x, to_translate.y, 1.0);

    // translation matrix
    mat3 trans = mat3(
    1.0, 0.0, 0.0,  
    0.0, 1.0, 0.0,
     tx,  ty, 1.0 
    );

    // conduct the translation
    vec3 translated = trans * to_translate_transformed;

    // return with the original third dimension
    return vec3(translated.x, translated.y, to_translate.z);
  } // end method
  
  /* scale a 3 element vector by factors sx, sy */
  vec3 scale(float sx, float sy, vec3 to_scale) {
    // scaling matrix
    mat3 scale = mat3(
       sx, 0.0, 0.0,  
      0.0,  sy, 0.0,
      0.0, 0.0, 1.0
    );

    return scale * to_scale;
  } // end method
  
  /* rotate a 3 element vector in a given direction */
  vec3 rotate(float degrees, vec3 to_rotate, bool clockwise) {
    // rotation matrix 
    mat3 rot;

    if (clockwise) {
      // clockwise rotation matrix
      rot = mat3(
        cos(degrees), -sin(degrees), 0.0,
        sin(degrees), cos(degrees), 0.0,
        0.0, 0.0, 1.0
      );
    } else {
      // counter clockwise rotation matrix
      rot = mat3(
        cos(degrees), sin(degrees), 0.0,
        -sin(degrees), cos(degrees), 0.0,
        0.0, 0.0, 1.0
      );
    } // end if

    return  rot * to_rotate;
  } // end method
  
  /* reflect a shape by d degrees */
  vec3 reflect_it(float degrees, vec3 to_reflect) {
    float two_theta = 2.0 * degrees; // for ease of computation below

    // reflection matrix
    mat3 refl = mat3(
      cos(two_theta),  sin(two_theta), 0.0,
      sin(two_theta), -cos(two_theta), 0.0,
                 0.0,             0.0, 1.0
    );

    return refl * to_reflect;
  } // end method
  
  
  /*===== MAIN ======*/
  in vec3 aPosition;
  in vec3 aColor;

  uniform float uTime; //time in sec
  out vec3 vColor;

  void main() {
    // final position
    // gl_Position = vec4(rotate(uTime, aPosition, true), 1.0);
    // gl_Position = vec4(translate(0.5, 1.0, aPosition), 1.0);
    // gl_Position = vec4(scale(1.0, 1.0, aPosition), 1.0);
    gl_Position = vec4(reflect_it(uTime, aPosition), 1.0);
    //gl_Position = vec4(aPosition, 1.0);

    vColor = reflect_it(uTime, aColor);
  }
  
```



