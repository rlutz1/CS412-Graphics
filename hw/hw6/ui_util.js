/**
 * some utility functions for some of the UI changes/actions.
 */

/**
 * function to see what checkboxes are checked
 * for transformation animations.
 * returns the values of the check'd boxes.
 * note that there is no order imposed on the transformations.
 */
function get_all_checkboxes(checkbox_name) {
  let checkboxes = document.getElementsByName(checkbox_name)
  let checked = []

  for (let i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      checked.push(checkboxes[i].value)
    } // end if
  } // end loop

  return checked
} // end method

/**
 * get the checked radio box value
 */
function get_radio(radio_name) {
  let radio_buttons = document.getElementsByName(radio_name)

  for (let i = 0; i < radio_buttons.length; i++) {
    if (radio_buttons[i].checked) {
      return radio_buttons[i].value;
    } // end if
  } // end loop

  return null
} // end function

/**
 * function to receive a list of readable values
 * from the checkboxes with name "transforms".
 * build the final matrix for transformation of the
 * object on canvas.
 */
function get_transform_matrix(transforms, time) {
  let transform_matrix = mat4Identity()

  const sint = Math.sin(time) // for general use
  const two_sint = 2 * sint
  
  for (let i = 0; i < transforms.length; i++) {
    const trans_type = transforms[i]
    
    switch(trans_type) {

      case "shear_x":
        transform_matrix = matMul(
          shear([sint, 0, 0]),
          transform_matrix
        )
        break 

      case "shear_y":
          transform_matrix = matMul(
          shear([0, sint, 0]),
          transform_matrix
        )
        break

      case "shear_z":
        transform_matrix = matMul(
          shear([0, 0, sint]),
          transform_matrix
        )
        break

      case "scale_x":
        transform_matrix = matMul(
          scale([two_sint, 0, 0]),
          transform_matrix
        )
        break 

      case "scale_y":
          transform_matrix = matMul(
          scale([0, two_sint, 0]),
          transform_matrix
        )
        break

      case "scale_z":
        transform_matrix = matMul(
          scale([0, 0, two_sint]),
          transform_matrix
        )
        break
      
      case "rotation_x":
        transform_matrix = matMul(
          rotate([time, 0, 0], true), 
          transform_matrix
        )
        break

      case "reflect_x":
        transform_matrix = matMul(
          reflect_x(), 
          transform_matrix
        )
        break

      case "reflect_y":
        transform_matrix = matMul(
          reflect_y(), 
          transform_matrix
        )
        break

      case "reflect_xy":
        transform_matrix = matMul(
          reflect_xy(), 
          transform_matrix
        )
        break

      case "rotation_y":
        transform_matrix = matMul(
          rotate([0, time, 0], true), 
          transform_matrix
        )
        break

      case "rotation_z":
        transform_matrix = matMul(
          rotate([0, 0, time], true), 
          transform_matrix
        )
        break
      
      case "translation_x":
        transform_matrix = matMul(
          translate([sint, 0, 0]),
          transform_matrix
        )
        break

      case "translation_y":
        transform_matrix = matMul(
          translate([0, sint, 0]),
          transform_matrix
        )
        break

      case "translation_z":
        transform_matrix = matMul(
          translate([0, 0, sint]),
          transform_matrix
        )
        break
      
      default:
        console.log(`get_transform_matrix got an unknown transform val: ${trans_type}`)
    } // end switch
  } // end loop
  
  return transform_matrix
} // end method


/**
 * select/deselect all of a of a given checkbox group.
 */ 
function select_all(select, checkbox_name){
  let checkboxes = document.getElementsByName(checkbox_name)

  for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = select
  } // end loop
} // end method


/**
 * get the constants for material: copper
 */
function get_copper_lighting() {
  return {
    "ka": [0.19125, 0.0735, 0.0225],
    "kd": [0.7038, 0.27048, 0.0828],
    "ks": [0.256777, 0.137622, 0.086014],
    "alpha": 12.8,
    "transparency": 1.0
  }
} // end function

/**
 * get the constants for material: copper
 */
function get_silver_lighting() {
  return {
    "ka": [0.19225, 0.19225, 0.19225],
    "kd": [0.50754, 0.50754, 0.50754],
    "ks": [0.508273, 0.508273, 0.508273],
    "alpha": 51.2,
    "transparency": 1.0
  }
} // end function

/**
 * get the constants for material: polished silver
 */
function get_polished_silver_lighting() {
  return {
    "ka": [0.23125, 0.23125, 0.23125],
    "kd": [0.2775, 0.2775, 0.2775],
    "ks": [0.773911, 0.773911, 0.773911],
    "alpha": 89.6,
    "transparency": 1.0
  }
} // end function

/**
 * 0.02
0.02
0.02 	0.01
0.01
0.01 	0.4
0.4
0.4 	10 	1.0
 */

/**
 * get the constants for material: polished silver
 */
function get_black_rubber_lighting() {
  return {
    "ka": [0.02, 0.02, 0.02],
    "kd": [0.01, 0.01, 0.01],
    "ks": [0.4, 0.4, 0.4],
    "alpha": 10,
    "transparency": 1.0
  }
} // end function

/**
 * funnel to grab the proper lighting based on 
 * user selection
 */
function get_material_lighting(type) {
  switch (type) {
    case "copper":
      return get_copper_lighting();
    case "polished_silver":
      return get_polished_silver_lighting();
    case "black_rubber":
      return get_black_rubber_lighting();
    default:
      return get_silver_lighting();
  } // end switch
} // end function