/** display an error in the error box*/
function show_error(err) {
  const error_box = document.getElementById("error-box")
  const error_text = document.createElement("p");
  error_text.textContent = err
  error_box.appendChild(error_text) 
  console.log(error_text)
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
}

try {
  build_triangle()
} catch (err) {
  show_error(`JS Exception: ${err}`)
}