/** constants for readability */
const ERROR_BOX = "error-box";
const CANVAS = "demo-canvas";

/** display an error in the error box*/
function show_error(err) {
  const error_box = document.getElementById(ERROR_BOX);
  const error_text = document.createElement("p");
  error_text.textContent = err;
  error_box.appendChild(error_text) ;
  console.log(error_text);
}

// testing error box
// show_error("testing the error box")

/**
 * main function to hold all webgl building of 
 * a triangle in our html canvas: demo-canvas.
 */
function build_triangle() {
  // testing try catch
  // throw new Error("testing!")
  
  // this is not necessary, but gives hint to VSCode
  // that this is a canvas element 
  /** @type (HTMLCanvasElement|null) */
  const canvas = document.getElementById(CANVAS);

  // likely a dom related loading error.
  // js is already included at the bottom of the index.html 
  // but a good check to have in place.
  if (!canvas){
    show_error("Likely canvas didn't load in time, be sure to have javascript loaded at end of HTML.");
    return;
  }

  // create a drawing context for this canvas.
  // can only have one per canvas.
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
  // webgl2 is really what should be used these days.
  const gl = canvas.getContext("webgl2");
  
  // check to make sure the context was created correctly!
  if (!gl) {
    show_error("Something went wrong when creating webgl2 context! browser doesn't likely support.");
    return; // for now, just stop this from working.
    // could try to recover by loading webgl(1) instead.
  }

  // first, clear the canvas.
  // webgl starts with a clear transparent image covering.
  // this is why we have the salmon color -- to make sure the 
  // clearing of the transparent covering WORKS.

  // webgl doesn't draw to one image, but instead draws to 
  // THREE BUFFERS:
  // 1. image (pict with colors)
  // 2. depth (depth info for each pixel in the output image)
  // 3. stencil buffer (graphics effects -> not covered here.)
  // below, we are setting the clear bits to ensure the buffers are cleared out
  // and webgl picks up from opengl the high-bit control for signalling
  // what to clear.
  // so, bitwise or can be used to tell to clear multiple buffers.
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // nothing happens.
  // if we want to clear with a color need to specify the color:
  // format: R, G, B, alpha; [0, 1]
  // gl.clearColor(0.5, 0.5, 0.5, 0.8); // set the clear color
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear with the set clear color

  // going to make a javascript array that has x, y of each of the 
  // triangle corners.
  // coordinates of x, y in webgl are -1, 1 (left, right; down, up)
  const triangle_coords = [
    // top middle
    0.0, 0.5,
    // middle left
    -0.5, 0.0,
    // middle right
    0.5, 0.0
    // kind of a squishy triangle.
  ];
  // gpus like 32 bit floats, js uses 64 bit floats!
  // also js arrays can have values scattered in memory
  const tri_to_gpu = new Float32Array(triangle_coords);
  // now, we need to send this float array to the gpu.
  // first, make a landing buffer on the gpu
  const tri_gpu_buffer = gl.createBuffer(); // webgl buffer type
  if (!tri_gpu_buffer) {
    // check for null return, implies you can't make any more buffers on gpu
    show_error("Cannot create anymore buffers! Exiting!");
    return;
  }
  // now we need to attach the buffer to an attachment point.
  // array buffer deals with vertex information (apparently)
  gl.bindBuffer(gl.ARRAY_BUFFER, tri_gpu_buffer);
  // now, the thing that's attached to this point? give it this data.
  // STATIC_DRAW is a hint to indicate what we're going to do with the data
  // so that it can be held in the optimal memory spot on GPU.
  // CPU only has ram, gpu has many spots!
  // STATIC_DRAW is likely not updated often, but may be drawn often.
  gl.bufferData(gl.ARRAY_BUFFER, tri_to_gpu, gl.STATIC_DRAW);

  // now we need to run shaders!
  // we have to write the shader in glsl as a js string and then send it off
  // to compile to run.

  // #version HAS to be first, with NOTHING before it
  // mediump -> controls the precision of arithmetic in the gpu; mediump is good middle
  // in vec2 vert_position -> glsl takes inputs as an attribute
  //   in -> keyword to signify we're getting something from a buffer
  //   vec2 -> the TYPE of the input; 2 floating point numbers (x and y!)
  //   vert_position -> var name
  // job: tell where the vertex image should be showing up on our clip space (canvas)
  // we've given part of it: vert_position
  // vert shader MUST set the gl_Position
  //   gl_Pos is  vec4 -> first is x, y
  //   third is the z, depth information. about the overlap of images.
  //   fourth number divides all x, y, z given before processing
  const vert_shader_src = `#version 300 es
  precision mediump float; 

  // you can write comments as normal!
  in vec2 vert_position;

  void main() {
    // same as: vec4(vert_position.x, vert_position.y, 0.0, 1.0)
    gl_Position = vec4(vert_position, 0.0, 1.0);
  }
  `;

  // now just need to
  // 1. create the shader
  // 2. set the source for the shader
  // 3. compile the shader
  const vert_shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vert_shader, vert_shader_src);
  gl.compileShader(vert_shader);

  // check for compilation problems so you don't lose your mind
  if (!gl.getShaderParameter(vert_shader, gl.COMPILE_STATUS)) {
    const compile_error = gl.getShaderInfoLog(vert_shader);
    show_error(`Compilation failed on vertex shader: ${compile_error}`);
    return;
  }

  // now onto the fragment shader, which is how we 
  // define how to color in the pixels that the vert 
  // shader has identified. (idk if that's the proper wording.)
  // we are going to color the triangle in as indigo.
  // for the frag shader, we have to specify our output variables manually.
  //
  // vert shaders need to always output a clip space drawing output
  // frag shaders don't have any required outputs.
  // webgl attatches our rgba output to color buffer by default so can name whatever.  
  const frag_shader_src = `#version 300 es
  precision mediump float; 

  out vec4 output_color;

  void main() {
    output_color = vec4(0.3, 0.0, 0.5, 1.0); // indigo
  }
  `;

   // now just need to
  // 1. create the shader
  // 2. set the source for the shader
  // 3. compile the shader
  const frag_shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(frag_shader, frag_shader_src);
  gl.compileShader(frag_shader);

  // check for compilation problems so you don't lose your mind
  if (!gl.getShaderParameter(frag_shader, gl.COMPILE_STATUS)) {
    const compile_error = gl.getShaderInfoLog(frag_shader);
    show_error(`Compilation failed on vertex shader: ${compile_error}`);
    return;
  }

  // now, need to combine the vert and frag shader into a PROGRAM
  // so they can work together.
  const tri_program = gl.createProgram();
  gl.attachShader(tri_program, frag_shader);
  gl.attachShader(tri_program, vert_shader);

  // now: link the program.
  // ensure the vertex and fragment shaders are COMPATIBLE with each other.
  gl.linkProgram(tri_program);

  // check for any incompatibilities!
  // sorta the same as compile check, but with link.
  if (!gl.getProgramParameter(tri_program, gl.LINK_STATUS)) {
    const link_error = gl.getProgramInfoLog(tri_program);
    show_error(`Linking shaders failed: ${link_error}`);
    return;
  }

  // NOW, we need to tell webgl how to read the input to the vertex shader
  // get the attribute locationof vert_position.
  // best use: just ask webgl to tell you where the location is
  //    in this simple example, it'll just be 0, but it can be problematic
  //    if something under the hood optimizes something away, moves
  //    something without you knowing. trust webgl to tell you.
  const vert_position_attr_location = gl.getAttribLocation(tri_program, 'vert_position');
  // console.log(vert_position_attr_location); // prints 0
  if (vert_position_attr_location < 0) { 
    // returns negative num if error
    show_error(`Something went wrong when grabbing vert_position; return code ${vert_position_attr_location}`)
    return;
  }

  // full graphics pipeline
  // performance should be considered, but order can be anything here up
  // to the draw call.

  // output merger
  // how to merge shaded pixel fragment with the existing output image
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  // need to clear here, apparently will redraw the transparent (even though maybe not happening on firefox for moi)
  // setting width/height triggers a re-draw
  gl.clearColor(0.5, 0.5, 0.5, 0.8); // set the clear color
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear with the set clear color

  // rasterizer
  // which pixels are part of image (triangle)
  // just focus on a portion of the screen (optimization)
  gl.viewport(0, 0, canvas.width, canvas.height);

  // set gpu program
  // vertex + fragment shader pair
  // 1. tell webgl to use a specific program
  // 2. IMPORTANT: enable all attributes you want to use.
  gl.useProgram(tri_program);
  gl.enableVertexAttribArray(vert_position_attr_location);

  // input assembler
  // how to read vertices from our gpu triangle buffer
  // for each input we are dealing with (only vert_pos here)
  //   which buffer will you read from?
  //   how do you read it into input (how to read into vec2)
  // ENSURE THE BUFFER IS ATTACHED! repeat of above below:
  gl.bindBuffer(gl.ARRAY_BUFFER, tri_gpu_buffer);
  gl.vertexAttribPointer(
    vert_position_attr_location, // index -> attribute location
    2, // size -> num components in attribute
    gl.FLOAT, // type -> type in gpu buffer that we're reading from
    false, // normalized -> how to convert int -> float, only worry about this if pertinent; false is safe; if float type, ignored
    0, // stride -> from first byte, how many bytes to move forward in buffer; 0 means webgl auto figures it out.
       // 2 * Float32Array.BYTES_PER_ELEMENT -> long form
    0 // offset -> how many bytes to skip into buffer when reading attr
  );

  // draw call -- all of the prior can be done in any order up until now.
  // this is when actual rendering will happen
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}


try {
  build_triangle();
} catch (err) {
  show_error(`JS Exception: ${err}`);
}