/**
 * file here is a holder for all point sampling
 * functions to generate a set of points over an interval
 * with a specific step.
 * this holds the functions for generating: sphere, cylinder
 */

/**
 * static primitive generation of a cube.
 */
function gen_cube_points() {

    const vertices = [
      -1, -1, -1,  // 0
      1, -1, -1,  // 1
      1,  1, -1,  // 2
      -1,  1, -1,  // 3
      -1, -1,  1,  // 4
      1, -1,  1,  // 5
      1,  1,  1,  // 6
      -1,  1,  1   // 7
    ];

    const indices = [
      // Front
      4, 5, 6,   4, 6, 7,
      // Back
      1, 0, 3,   1, 3, 2,
      // Top
      3, 7, 6,   3, 6, 2,
      // Bottom
      0, 1, 5,   0, 5, 4,
      // Right
      1, 2, 6,   1, 6, 5,
      // Left
      0, 4, 7,   0, 7, 3,
    ];

    // return as a js dict
    return {
      "vertices": new Float32Array(vertices), 
      "indices": new Uint16Array(indices)
    } 
} // end function
/**
 * generate colors of a cube either with dynamicism or
 * just a solid color.
 */
// (num_vertices, solid_color=null)
function gen_cube_colors(num_vertices, solid_color=null) {
  if (solid_color != null) {
    return new Float32Array([
      1,0,0,  0,1,0,  0,0,1, 1,1,0, 1,0,1, 0,1,1, 1,1,0, 1,0,1
    ]);
  } // end if
  
  cube_colors = [];
  for (let i = 0; i < num_vertices; i++) {
    cube_colors.push(...solid_color);
  } // end loop

  return new Float32Array(cube_colors);
} // end function


/**
 * generate sphere points from parametric representation.
 * x = x_c + r * sin(v) * cos(u)
 * y = y_c + r * sin(v) * sin(u)
 * z = z_c + r * cos(v)
 *
 */
function gen_sphere_points(
  r=1.0, // radius of the sphere
  center=[0, 0, 0], // center of the sphere
  h_step=0.1, // horizontal step interval 
  v_step=0.1, // vertical step interval
  h_range=[0, (2 * Math.PI)], // the interval of the latitudinal point generation (horizontal, relatively)
  v_range=[0, Math.PI] // the interval of the longitudinal point generation (vertical, relatively)
) {

  // save for later use indexing
  const v_min = v_range[0]
  const v_max = v_range[1]
  const h_min = h_range[0]
  const h_max = h_range[1]

  // how many steps we are taking in that range.
  let h_steps = Math.round(Math.abs(h_max - h_min) / h_step)
  let v_steps = Math.round(Math.abs(v_max - v_min) / v_step)

  const vertices = [] // simple js array for collection of vertices
  const indices = [] // js array for collecting indices
  const norms = [] // normals of the planes generated

  // ==================================
  //  GENERATE POINTS
  // ==================================

  vertices.push(center[0], r, center[2]) // save the north polar cap
  norms.push(0, r, 0); // pointing straight up

  // generate the bands of the sphere
  for (let v_i = 1; v_i < v_steps; v_i++) { // for each vertical step
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
          const z = center[1] + (r * sin_v * sin_h)
          const y = center[2] + (r * cos_v)
          vertices.push(x, y, z) // save the points
          // TODO norms.push
      } // end loop
    } // end loop
   
    vertices.push(center[0], -r, center[2]) // save the south polar cap
    norms.push(0, -r, 0); // pointing straight down

    // ==================================
    //  GENERATE INDICES
    // ==================================

    let last_pt_index = (vertices.length / 3) - 1 // the LAST POINT in the list of vertices, so the south polar cap
    let lower_band = last_pt_index - h_steps // the min index of the band just "below" the south cap

    // set up the polar NORTH indices
    // set them up in a triangular way, all connecting to the south pole:
    //      \ | /
    //   -- pole --
    //      / | \
    for (let i = 1; i < h_steps; i++) { // for each horizontal step
                                // if h steps == 4, 
      indices.push(0, i, i + 1) // generally: n. pole, 1, 2; n. pole, 2, 3; n. pole, 3, 4
    } // end loop
    indices.push(0, h_steps, 1) // special case: final vertex wraps back to start: n. pole, 4, 1

    // set up the middle banding indeces (general case)
    // going to start from the upper band and "reach down" to the lower band below.
    // going in the motion:
    // bottom_left -- bottom_right
    //      |       /    |
    // top_left    -- top_right
    for (let band_walker = 1; band_walker < lower_band; band_walker += h_steps) {  // walk through all bands until reach south pole
      for (let i = 0; i < h_steps - 1; i++) { // walk across the band, with special case on final setup
        const bottom_left = band_walker + i // the "bottom left" point
        const top_left = bottom_left + h_steps // the "top left" point
        const top_right = bottom_left + h_steps + 1 // "top right" point
        const bottom_right = bottom_left + 1 // "bottom right" point

        // add the two triangles this set of vertices makes.
        indices.push(
          bottom_left, top_left, top_right,
          bottom_left, bottom_right, top_right
        )
      } // end loop 

      // special last case: we need to wrap around slightly
      const bottom_left = band_walker + h_steps - 1 // final addition/point on band
      const top_left = bottom_left + h_steps // still normal top left
      const top_right = band_walker + h_steps // wrap around to the beginning of the lower band vertex
      const bottom_right = band_walker // wrap around to the beginning of the band vertex

      // push the final index
      indices.push(
          bottom_left, top_left, top_right,
          bottom_left, bottom_right, top_right
        )
    } // end loop
  
    // in same way we set up the north pol, we set up the SOUTH pole indeces
    // with the last band.
    for (let i = lower_band; i < last_pt_index - 1; i++) {
      indices.push(last_pt_index, i, i + 1)
    } // end loop
    indices.push(last_pt_index, last_pt_index - 1, lower_band) // final point wrap around.

  // return as a js dict
  return {
    "vertices": new Float32Array(vertices), 
    "indices": new Uint16Array(indices),
    "norms": new Float32Array([]) // TODO
  } 
} // end method

// just some fun colors to play around with.
function gen_sphere_colors(num_vertices, solid_color=null) {
  let sphere_color = []
  if (solid_color == null) {
    for (let v = 0; v < num_vertices; v++) {
      if (v % 9 == 0) {
        sphere_color.push(0.3, 0, 0.3)
      } else if (v % 9 == 2) {
        sphere_color.push(0.3, 0, 0.4)
      } else if (v % 9 == 6) {
        sphere_color.push(0.0, 0.5, 0.4)
      } else if (v % 9 == 8) {
        sphere_color.push(0.0, 0.5, 0.7)
      } else {
        sphere_color.push(0.1, 0, 0.1)
      } // end if
    } // end loop
    return new Float32Array(sphere_color)
  } // end if
  
  // use a solid color only.
  for (let v = 0; v < num_vertices; v++) {
    // if (v % 6 == 0) { // for a little depth since no lighting.
      sphere_color.push(...solid_color)
    // } else {
    //   const offset = solid_color.map(num => num * 1/2);
    //   sphere_color.push(...offset)
    // } // end if
  } // end loop
  return new Float32Array(sphere_color)
} // end method


/**
 * cylinder point generation using parametric forms:
 * x = x_c + r * cos(u)
 * y = x_c + r * sin(u) 
 * z = x_c + r * h * v
 * 
 */
function gen_cylinder_points(
  r=1.0, // radius of the cylinder
  height=1.0, // height of the cylinder
  base=[0, 0, 0], // base of the cylinder
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

  // save for later use.
  const base_x = base[0]
  const base_y = base[1]
  const base_z = base[2]

  const vertices = [] // simple js array for collection of vertices
  const indices = [] // js array for collecting indices
  const norms = []; // norms for the planes

  // ==================================
  //  GENERATE POINTS
  // ==================================

  // this is the base middle point
  vertices.push(base_x, base_y, base_z) 
  norms.push(0, -1, 0); // pointing straight down


  // generate the bands of the side of the cylinder.
  for (let v_i = 0; v_i <= v_steps; v_i++) { // for each vertical step
    // get our current v, which is the v in (h, v)
    const v = v_min + (v_i * v_step)

    for (let h_i = 0; h_i < h_steps; h_i++) { // for each horizontal step
      // get our current h, which is the h in (h, v)
      const h = h_min + (h_i * h_step)
      const cos_h = Math.cos(h) // save for later
      const sin_h = Math.sin(h)

      // gather the points using parametric form
      const x = base_x + (r * cos_h)
      const z = base_y + (r * sin_h)
      const y = base_z + (height * v)

      vertices.push(x, y, z) // save the points
      norms.push(x, 0, z); // pointing straight out to sides of x, z, but no y value
    } // end loop
  } // end loop
  
  // bottom middle point, mimicking last z value created
  // accounts for anything not quite reaching the actual height value (rounding issues cause lumps!).
  vertices.push(base_x, vertices.at(-2), base_z) // save the polar cap
  norms.push(0, 1, 0); // pointing straight up

  // ==================================
  //  GENERATE INDICES
  // ==================================

  // this is done wiht ~the same approach as the sphere!
  // see that method for more detailed explanations.

  let last_pt_index = (vertices.length / 3) - 1 // last poss index
  let lower_band = last_pt_index - h_steps // the start of the last band

  // create the base indeces, again making a spokes-in-wheel connection
  for (let i = 1; i < h_steps; i++) {
    indices.push(0, i, i + 1)
  } // end loop
  indices.push(0, h_steps, 1) // special case wrap around

  // set up the banding indeces in the same triangular way as sphere
  for (let band_index = 1; band_index < lower_band; band_index += h_steps) { 
    for (let inc = 0; inc < h_steps - 1; inc++) {
      // grab all 4 indeces for 2 triangles
      const bottom_left = band_index + inc 
      const top_left = bottom_left + h_steps 
      const top_right = bottom_left + h_steps + 1 
      const bottom_right = bottom_left + 1 

      // and the two triangles
      indices.push(
        bottom_left, top_left, top_right,
        bottom_left, bottom_right, top_right
      )
    } // end loop 

    // special last case wrap around
    const bottom_left = band_index + h_steps - 1 
    const top_left = bottom_left + h_steps 
    const top_right = band_index + h_steps 
    const bottom_right = band_index 

    // add the triangles
    indices.push(
        bottom_left, top_left, top_right,
        bottom_left, bottom_right, top_right
      )
  } // end loop

  // finally, set up the top center spoke pattern
  for (let i = lower_band; i < last_pt_index - 1; i++) {
    indices.push(last_pt_index, i, i + 1)
  } // end loop
  indices.push(last_pt_index, last_pt_index - 1, lower_band) // special case wrap around

  // return as a js dict
  return {
    "vertices": new Float32Array(vertices), 
    "indices": new Uint16Array(indices),
    "norms": new Float32Array(norms)
  } 
} // end method

// quick testing colors for fun
function gen_cylinder_colors(num_vertices, solid_color=null) {
  let cyl_color = []
  if (solid_color == null) { // set a default pattern.
    for (let v = 0; v < num_vertices; v++) {
      if (v % 6 == 0) {
        cyl_color.push(0.3, 0.3, 0)
      } else if (v % 6 == 2) {
        cyl_color.push(0.3, 0.6, 0)
      } else {
        cyl_color.push(0.1, 0, 0.1)
      } // end if
    } // end loop
    return new Float32Array(cyl_color)
  } // end if

  // use a solid color only.
  for (let v = 0; v < num_vertices; v++) {
    // if (v % 6 == 0) { // for a little depth since no lighting.
    //   const offset = solid_color.map(num => num * 1/2);
    //   cyl_color.push(...offset)
    // } else {
    cyl_color.push(...solid_color)
    // } // end if
  } // end loop
  return new Float32Array(cyl_color)
} // end method
