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
  r=1.0, // radius of the sphere
  center=[0, 0, 0], // center of the sphere
  h_step=0.3, // horizontal step interval
  v_step=0.3, // vertical step interval
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
  // console.log(Math.ceil(v_steps))

  const vertices = [] // simple js array for collection of vertices
  const indeces = [] // js array for collecting indeces

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

        // TODO: starting from 0 gives a repeat point like 63 times
        // 6.28/0.1 (2pi/step) times. should see about optimizing that unneeded
        // repetition.
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

        } // end loop
      } // end loop
    }
   
    // SET UP POLAR NORTH INDECES
    for (let i = 1; i < h_steps - 1; i++) { // for each horizontal step
      indeces.push(0, i, i + 1)
    } // end loop
    indeces.push(0, h_steps - 1, 1)

    // SET UP THE POLAR SOUTH INDECES
    let last_pt_index = (vertices.length / 3) - 1 // 9
    let lower_band = last_pt_index - h_steps // 5
    
    for (let i = lower_band; i < last_pt_index - 1; i++) {
      indeces.push(last_pt_index, i, i + 1)
    }
    indeces.push(last_pt_index, last_pt_index - 1, lower_band)

    // console.log(indeces)

    // SET UP THE MIDDLE VERTICES (general case)

    for (let starter = 1; starter < lower_band; starter += h_steps) { // TODO: -1 is important
      for (let inc = 0; inc < h_steps; inc++) {
        // const bottom_left = h_i + (h_steps * v_i) 
        // const top_left = h_i + (h_steps * (v_i + 1)) 
        // const top_right = top_vert + 1
        // const bottom_right = bottom_vert + 1
        
        const bottom_left = starter + inc // 1
        const top_left = bottom_left + h_steps // 5
        const top_right = bottom_left + h_steps + 1
        const bottom_right = bottom_left + 1


        indeces.push(
          bottom_left, top_left, top_right,
          bottom_left, bottom_right, top_right
        )
      } // end loop 
    } // end loop


  // for (let v_i = 0; v_i < v_steps; v_i++) { // TODO: -1 is important
  //   for (let h_i = 0; h_i < h_steps; h_i++) { // for each horizontal step
  //     if (v_i == 0) { // north pole
  //       indeces.push(v_i, h_i + 1, (h_i + 2) % (h_steps + 1))
  //      //else if (v_i == v_steps - 1) { // south pole
  //     //   const bottom_vert = h_i + (h_steps * v_i)
  //     //   const bottom_next_vert = bottom_vert + 1
  //     //   indeces.push(bottom_vert, bottom_next_vert, vertices.length / 3)
  //     } else {
  //       // TODO: explain this from the derivation on paper
  //       // const bottom_vert = h_i + (h_steps * v_i) 
  //       // const top_vert = h_i + (h_steps * (v_i + 1)) 
  //       // const top_next_vert = top_vert + 1
  //       // const bottom_next_vert = bottom_vert + 1
  //       const k1 = (v_i * (h_steps + 1)) + h_i
  //       const k2 = k1 + h_steps 

  //       indeces.push(
  //         k1, k2, k1 + 1,
  //         k2, k2 + 1, k1 + 1
  //       )

  //       // indeces.push(
  //       //   bottom_vert, top_vert, top_next_vert,
  //       //   bottom_vert, bottom_next_vert, top_next_vert
  //       // )
  //     } // end if
  //   } // end loop
  // } // end loop
    

  // console.log(vertices)
  // console.log("=======================")
  // console.log(indeces)
  // testing only
  // for (let i = 0; i < indeces.length; i += 3) {
  //   console.log(`(${indeces[i]}, ${indeces[i+1]}, ${indeces[i+2]})`)
  // }

  return {"vertices": vertices, "indeces": indeces} // return as a js dict
}

// testing only to ensure different colors to distinguish
function sphere_colors(num_vertices) {
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

  return sphere_color
}

