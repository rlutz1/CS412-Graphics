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
    show_error("Something went wrong when creating webgl2 context!");
    return; // for now, just stop this from working.
  }
}

try {
  build_triangle();
} catch (err) {
  show_error(`JS Exception: ${err}`);
}