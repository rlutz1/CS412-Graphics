

/** display an error in the error box*/
function show_error(err) {
  const error_box = document.getElementById("error-box")
  const error_text = document.createElement("p");
  error_text.textContent = err
  error_box.appendChild(error_text) 
  console.log(error_text)
}

show_error("testing the error box")
