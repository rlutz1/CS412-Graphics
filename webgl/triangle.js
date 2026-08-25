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
  gl.clearColor(0.5, 0.5, 0.5, 0.8); // set the clear color
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear with the set clear color


}

try {
  build_triangle();
} catch (err) {
  show_error(`JS Exception: ${err}`);
}