/**
 * for writing custom logic to generate objects in 
 * a hierarchy.
 */

/**
 * generate a simple arm out of cylinders.
 * going to return a SceneObject that has the 
 * hierarchy of 4 times: 
 * base -> seg2 -> seg3 -> top
 */
function generate_arm(gl) {
  // construct the hierarchy as a SceneObject
  const object = new SceneObject("arm", gl);
  object.init(basic_vert_shader, basic_frag_shader);

  // generate the base.
  // basic cylinder, rotated on x to appear upright, just basic fat cylinder.
  let cyl_verts_and_indices = gen_cylinder_points(); // the vertices to start with
  let cyl_colors = gen_cylinder_colors(cyl_verts_and_indices.vertices.length);
  let part_transforms = [rotate([deg_to_rad(90), 0, 0], true)];

  // make this a scene node.
  const base = new SceneObjectNode("base", cyl_verts_and_indices, cyl_colors, part_transforms, gl, object.program);

  // generate the next segment.
  // basic cylinder, rotated on x to appear upright, just basic fat cylinder.
  cyl_verts_and_indices = gen_cylinder_points(); // the vertices to start with
  cyl_colors = gen_cylinder_colors(cyl_verts_and_indices.vertices.length);
  part_transforms = [translate([0, 1, 0]), rotate([deg_to_rad(90), 0, 0], true)];

  // make this a scene node.
  const seg2 = new SceneObjectNode("seg2", cyl_verts_and_indices, cyl_colors, part_transforms, gl, object.program);

  // // generate the next segment.
  // // basic cylinder, rotated on x to appear upright, just basic fat cylinder.
  // cyl_verts_and_indices = gen_cylinder_points(); // the vertices to start with
  // cyl_colors = gen_cylinder_colors(cyl_verts_and_indices.vertices.length);
  // part_transforms = [translate([0, 2, 0]), rotate([deg_to_rad(90), 0, 0], true)];

  // // make this a scene node.
  // const seg3 = new SceneObjectNode("seg3", cyl_verts_and_indices, cyl_colors, part_transforms, gl, object.program);

  // TODO: make the top -- need 4, but testing with 3 to start.
  object.add_root(base); // format: node to add, parent 
  base.add_child(seg2);
  // seg2.add_child(seg3);

  return object;

} // end function
