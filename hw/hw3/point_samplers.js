/**
 * file here is a holder for all point sampling
 * functions to generate a set of points over an interval
 * with a specific step.
 */


/**
 * generate sphere points from parametric representation.
 * x = x_c + r * sin(v) * cos(u)
 * y = y_c + r * sin(v) * sin(u)
 * z = z_c + r * cos(v)
 * center: (x_c, y_c, z_c)
 */
function gen_sphere_points(
  r=1.5, // radius of the sphere
  center=[0, 0, 0], // center of the sphere
  h_step=0.1, // horizontal step interval
  v_step=0.1, // vertical step interval
  h_range=[0, (2 * Math.PI)], // the interval of the latitudinal point generation (horizontal, relatively)
  v_range=[0, Math.PI] // the interval of the longitudinal point generation (vertical, relatively)
) {

  // save for non-constant indexing
  const v_min = v_range[0]
  const v_max = v_range[1]
  const h_min = h_range[0]
  const h_max = h_range[1]


  // how many steps we are taking in that range.
  let h_steps = Math.round(Math.abs(h_max - h_min) / h_step)
  let v_steps = Math.round(Math.abs(v_max - v_min) / v_step)

  const vertices = [] // simple js array for collection of vertices
  const indices = [] // js array for collecting indices

  for (let v_i = 0; v_i <= v_steps; v_i++) { // for each vertical step
    if (v_i == 0) { // north pole
      vertices.push(center[0], center[1], r) // save the polar cap
    } else if (v_i == v_steps) { // south pole
      vertices.push(center[0], center[1], -r) // save the polar cap
    } else {
       // get our current v, which is the v in (h, v)
        const v = v_min + (v_i * v_step)
        const sin_v = Math.sin(v) // save for later
        const cos_v = Math.cos(v)

        for (let h_i = 0; h_i < h_steps; h_i++) { // for each horizontal step
          // get our current h, which is the h in (h, v)
          const h = h_min + (h_i * h_step)
          const cos_h = Math.cos(h) // save for later
          const sin_h = Math.sin(h)

          // gather the points using parametric form
          const x = center[0] + (r * sin_v * cos_h)
          const y = center[1] + (r * sin_v * sin_h)
          const z = center[2] + (r * cos_v)
          // console.log(x, y, z)
          vertices.push(x, y, z) // save the points

        } // end if
      } // end loop
    } // end loop
   
    let last_pt_index = (vertices.length / 3) - 1 // 9
    let lower_band = last_pt_index - h_steps // 5

    // SET UP POLAR NORTH indices
    for (let i = 1; i < h_steps; i++) { // for each horizontal step
      indices.push(0, i, i + 1)
    } // end loop
    indices.push(0, h_steps, 1)

    // SET UP THE MIDDLE VERTICES (general case)
    for (let band_index = 1; band_index < lower_band; band_index += h_steps) { // TODO: -1 is important
      for (let inc = 0; inc < h_steps - 1; inc++) {
        const bottom_left = band_index + inc // 1
        const top_left = bottom_left + h_steps // 5
        const top_right = bottom_left + h_steps + 1 // 6
        const bottom_right = bottom_left + 1 // 2

        indices.push(
          bottom_left, top_left, top_right,
          bottom_left, bottom_right, top_right
        )
      } // end loop 
      // special last case
      const bottom_left = band_index + h_steps - 1 // 4
      const top_left = bottom_left + h_steps // 8
      const top_right = band_index + h_steps // 5
      const bottom_right = band_index // 1

      indices.push(
          bottom_left, top_left, top_right,
          bottom_left, bottom_right, top_right
        )
    } // end loop
  
    // SET UP THE POLAR SOUTH indices
    for (let i = lower_band; i < last_pt_index - 1; i++) {
      indices.push(last_pt_index, i, i + 1)
    }
    indices.push(last_pt_index, last_pt_index - 1, lower_band)

  return {
    "vertices": new Float32Array(vertices), 
    "indices": new Uint16Array(indices)
  } // return as a js dict
}

// testing only to ensure different colors to distinguish
function gen_sphere_colors(num_vertices) {
  let sphere_color = []

  for (let v = 0; v < num_vertices; v++) {
    if (v % 3 == 0) {
      sphere_color.push(1, 0, 0)
    } else if (v % 3 == 1) {
      sphere_color.push(0, 1, 0)
    } else {
      sphere_color.push(0, 0, 1)
    }
  }

  return new Float32Array(sphere_color)
}


function gen_cylinder_points(
  r=1.5, // radius of the cylinder
  height=2.0, // height of the cylinder
  center=[0, 0, 0], // center of the sphere
  h_step=0.1, // horizontal step interval (u)
  v_step=0.1, // vertical step interval (v)
  h_range=[0, (2 * Math.PI)], // the interval of the latitudinal point generation (horizontal, relatively)
  v_range=[0, 1] // the interval of the longitudinal point generation (vertical, relatively)
) {
  // save for non-constant indexing
  const v_min = v_range[0]
  const v_max = v_range[1]
  const h_min = h_range[0]
  const h_max = h_range[1]

  // how many steps we are taking in that range.
  let h_steps = Math.round(Math.abs(h_max - h_min) / h_step)
  let v_steps = Math.round(Math.abs(v_max - v_min) / v_step)

  const vertices = [] // simple js array for collection of vertices
  const indices = [] // js array for collecting indices

  // top middle point
  vertices.push(center[0], center[1], center[2]) // save the polar cap

  for (let v_i = 0; v_i <= v_steps; v_i++) { // for each vertical step
    // get our current v, which is the v in (h, v)
    const v = v_min + (v_i * v_step)

    for (let h_i = 0; h_i < h_steps; h_i++) { // for each horizontal step
      // get our current h, which is the h in (h, v)
      const h = h_min + (h_i * h_step)
      const cos_h = Math.cos(h) // save for later
      const sin_h = Math.sin(h)

      // gather the points using parametric form
      const x = center[0] + (r * cos_h)
      const y = center[1] + (r * sin_h)
      const z = center[2] + (height * v)
      // console.log(x, y, z)
      vertices.push(x, y, z) // save the points
    } // end loop
  } // end loop
  
  // bottom middle point, mimicking last z value created
  // accounts for anything not quite reaching the actual height value.
  vertices.push(center[0], center[1], vertices.at(-1)) // save the polar cap

  // set up the indices
  let last_pt_index = (vertices.length / 3) - 1 // 9
  let lower_band = last_pt_index - h_steps // 5

  // SET UP POLAR NORTH indices
  for (let i = 1; i < h_steps; i++) { // for each horizontal step
    indices.push(0, i, i + 1)
  } // end loop
  indices.push(0, h_steps, 1)

  // SET UP THE MIDDLE VERTICES (general case)
  for (let band_index = 1; band_index < lower_band; band_index += h_steps) { // TODO: -1 is important
    for (let inc = 0; inc < h_steps - 1; inc++) {
      const bottom_left = band_index + inc // 1
      const top_left = bottom_left + h_steps // 5
      const top_right = bottom_left + h_steps + 1 // 6
      const bottom_right = bottom_left + 1 // 2

      indices.push(
        bottom_left, top_left, top_right,
        bottom_left, bottom_right, top_right
      )
    } // end loop 
    // special last case
    const bottom_left = band_index + h_steps - 1 // 4
    const top_left = bottom_left + h_steps // 8
    const top_right = band_index + h_steps // 5
    const bottom_right = band_index // 1

    indices.push(
        bottom_left, top_left, top_right,
        bottom_left, bottom_right, top_right
      )
  } // end loop

  // SET UP THE POLAR SOUTH indices
  for (let i = lower_band; i < last_pt_index - 1; i++) {
    indices.push(last_pt_index, i, i + 1)
  }
  indices.push(last_pt_index, last_pt_index - 1, lower_band)

  return {
    "vertices": new Float32Array(vertices), 
    "indices": new Uint16Array(indices)
  } // return as a js dict
}

// quick testing colors
function gen_cylinder_colors(num_vertices) {
  let cyl_color = []

  for (let v = 0; v < num_vertices; v++) {
    if (v % 3 == 0) {
      cyl_color.push(1, 0, 0)
    } else if (v % 3 == 1) {
      cyl_color.push(0, 1, 0)
    } else {
      cyl_color.push(0, 0, 1)
    }
  }

  return new Float32Array(cyl_color)
}
