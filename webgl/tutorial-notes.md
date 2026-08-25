# tutorial notes

[tutorial vid](https://www.youtube.com/watch?v=y2UsQB3WSvo)


https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html
+ webgl is a **rasterization engine**
	+ draws based on supplied code 
+ runs on GPU
+ write code in form of pairs of functions: 
	+ fragment shader
		+ compute color  for each pixel of primitive being drawn
	+ vertex shader
		+ compute vertex positions -- based on these webgl rasterizes primitives
			+ primitives: points, lines, triangles
	+ ^^ each written in strictly typed C/C++ like lang: **GLSL**
		+ OR FUCKIN JAVASCRIPT
		+ GL shader language
+ https://webgl2fundamentals.org/webgl/lessons/resources/webgl-state-diagram.html
+ there are specific types that must be used for shader to receive data because the data must be provided to the GPU
	+ attributes, buffers, vertex arrays
	+ uniforms
	+ textures
	+ varyings
+ my job is to PROVIDE CLIP SPACE COORDINATES AND COLORS




## [tutorial vid walk through](https://www.youtube.com/watch?v=y2UsQB3WSvo)

drawing a triangle

1. triangle defined as 3 points
```
[
/# vertex == POINT
0.0,  0.0
0.5, -0.5,
0.5, -0.5 
]
```
2. buffer that to a series of bytes to be palatable by the gpu -- **vertex buffer**
3. have to define how the gpu reads data out of the buffer by **declaring attributes**
4. primitive assembly: webgl starts grouping together 3 points as triangles somewhat automatically? but sounds like can customize potentially
	+ *webgl organizes vertices in groups of 3*
5. **rasterization**: looks at the dimension of the canvas and then figures out what pixels should be the color we told it to be
  + figure out the pixels that NEED fragment shading
6. each of the pixels goes through the **fragment shader** and colors as is told the given pixels	
	+ actually fill in the pixels from the 	rasterization step.

### general notes

+ coords are -1, 1??? oof
+ javascript does not make arrays meaning data is not guaranteed to be consecutive, hence the Float32Array conversions
+ the STATIC DRAW hint is basically so you know where the data can go for the gpu
	+ cpu has only one real option for storing the data -- ram
	+ gpu has multiple options that are better for different things???

QUESTIONS:

+ *3 different buffers: color, depth, stencil -- why?? and what do they do*
+ *look into the reasons buffers could just not be created -- space? gl.createBuffer()*
+ *the fourth number here. gl_Position = vec4(vert_position, 0.0, 1.0);*

