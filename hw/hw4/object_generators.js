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
  let verts_and_indices = gen_cylinder_points(); // the vertices to start with
  let colors = gen_cylinder_colors(verts_and_indices.vertices.length, [1, 0, 0]);
  let static_transforms = [scale([1, 0.8, 1]), rotate([deg_to_rad(270), 0, 0], true), translate([0, 0, -2])];

  // make this a scene node.
  const base = new SceneObjectNode("base", verts_and_indices, colors, static_transforms, gl, object.program);

  // generate the next segment.
  // basic cylinder, rotated on x to appear upright, just basic fat cylinder.
  verts_and_indices = gen_cylinder_points(); // the vertices to start with
  colors = gen_cylinder_colors(verts_and_indices.vertices.length, [1, 0.2, 0.2]);
  static_transforms = [scale([0.8, 1, 1]), translate([0, 0, 1])];

  // make this a scene node.
  const seg2 = new SceneObjectNode("seg2", verts_and_indices, colors, static_transforms, gl, object.program);

  // generate the next segment.
  // basic cylinder, rotated on x to appear upright, just basic fat cylinder.
  verts_and_indices = gen_cylinder_points(); // the vertices to start with
  colors = gen_cylinder_colors(verts_and_indices.vertices.length, [1, 0.5, 0.5]);
  static_transforms = [scale([0.8, 1, 1]), translate([0, 0, 1])];

  // make this a scene node.
  const seg3 = new SceneObjectNode("seg3", verts_and_indices, colors, static_transforms, gl, object.program);


  // generate the next segment.
  // basic cylinder, rotated on x to appear upright, just basic fat cylinder.
  verts_and_indices = gen_cylinder_points(); // the vertices to start with
  colors = gen_cylinder_colors(verts_and_indices.vertices.length, [1, 0.7, 0.7]);
  static_transforms = [scale([0.8, 1, 1]), translate([0, 0, 1])];

  // make this a scene node.
  const seg4 = new SceneObjectNode("seg4", verts_and_indices, colors, static_transforms, gl, object.program);

  verts_and_indices = gen_sphere_points(); // the vertices to start with
  colors = gen_sphere_colors(verts_and_indices.vertices.length, [1, 1, 1]);
  static_transforms = [scale([0.5, 0.5, 0.5]), translate([0, 0, 2])];

  // make this a scene node.
  const top = new SceneObjectNode("top", verts_and_indices, colors, static_transforms, gl, object.program);

  // TODO: make the top -- need 4, but testing with 3 to start.
  object.add_root(base); // format: node to add, parent 
  base.add_child(seg2);
  seg2.add_child(seg3);
  seg3.add_child(seg4);
  seg4.add_child(top);

  return object;

} // end function
