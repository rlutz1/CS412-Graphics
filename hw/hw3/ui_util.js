/**
 * function to see what checkboxes are checked
 * for transformation animations.
 * returns the values of the check'd boxes.
 * note that there is no order imposed on the transformations.
 */
function get_all_transforms(checkbox_name) {
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