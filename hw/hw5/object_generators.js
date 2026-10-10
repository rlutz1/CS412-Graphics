/**
 * for writing custom logic to generate objects in 
 * a hierarchy.
 */

/**
 * generate a simple cake out of cylinders with sphere at top.
 * going to ret5rn a SceneObject that has the 
 * hierarchy of 4 times: 
 * base -> seg2 -> seg3 -> seg4-> top
 */
function generate_cake(gl) {
  // construct the hierarchy as a SceneObject
  const object = new SceneObject("cake", gl);
  object.init(basic_vert_shader, basic_frag_shader);

  // generate the base.
  // basic cylinder, rotated on x to appear upright, just basic fat cylinder.
  let verts_and_indices = gen_cylinder_points(); // the vertices to start with
  let colors = gen_cylinder_colors(verts_and_indices.vertices.length, [1, 0, 0]);
  let static_transforms = [scale([1, 0.8, 1]), rotate([deg_to_rad(270), 0, 0], true), translate([0, 0, -2])];

  // make this a scene node.
  const base = new SceneObjectNode("base", verts_and_indices, colors, static_transforms, gl, object.program);

  // generate the next segment.
  verts_and_indices = gen_cylinder_points(); // the vertices to start with
  colors = gen_cylinder_colors(verts_and_indices.vertices.length, [1, 0.2, 0.2]);
  static_transforms = [scale([0.8, 1, 1]), translate([0, 0, 1])];

  // make this a scene node.
  const seg2 = new SceneObjectNode("seg2", verts_and_indices, colors, static_transforms, gl, object.program);

  // generate the next segment.
  verts_and_indices = gen_cylinder_points(); // the vertices to start with
  colors = gen_cylinder_colors(verts_and_indices.vertices.length, [1, 0.5, 0.5]);
  static_transforms = [scale([0.8, 1, 1]), translate([0, 0, 1])];

  // make this a scene node.
  const seg3 = new SceneObjectNode("seg3", verts_and_indices, colors, static_transforms, gl, object.program);


  // generate the next segment.
  verts_and_indices = gen_cylinder_points(); // the vertices to start with
  colors = gen_cylinder_colors(verts_and_indices.vertices.length, [1, 0.7, 0.7]);
  static_transforms = [scale([0.8, 1, 1]), translate([0, 0, 1])];

  // make this a scene node.
  const seg4 = new SceneObjectNode("seg4", verts_and_indices, colors, static_transforms, gl, object.program);

  // generate the top segment.
  verts_and_indices = gen_sphere_points(); // the vertices to start with
  colors = gen_sphere_colors(verts_and_indices.vertices.length, [1, 1, 1]);
  static_transforms = [scale([0.5, 0.5, 0.5]), translate([0, 0, 2])];

  // make this a scene node.
  const top = new SceneObjectNode("top", verts_and_indices, colors, static_transforms, gl, object.program);

  // specify hierarchy with base as the root node for this object.
  object.add_root(base); 
  base.add_child(seg2);
  seg2.add_child(seg3);
  seg3.add_child(seg4);
  seg4.add_child(top);

  return object;
} // end function

/**
 * just a little wrapper around creating the hierarchy of
 * dynamic/joint transforms that is read in by the scene graph
 * to allow for dynamic changing of the movement of this
 * object from the front end input.
 */
function generate_cake_json(dynamic_transforms) {

  return {
    "cake": {
      
      "base": {
        "dynamic_transforms": dynamic_transforms["base"],
        "joint_transforms": [],
        
        "seg2": {
          "dynamic_transforms": dynamic_transforms["seg2"],
          "joint_transforms": [],
          
          "seg3": {
            "dynamic_transforms": dynamic_transforms["seg3"],
            "joint_transforms": [],

            "seg4": {
              "dynamic_transforms": dynamic_transforms["seg4"], 
              "joint_transforms": [],

              "top": {
                "dynamic_transforms": dynamic_transforms["top"],
                "joint_transforms": [translate([0, 0, 1])],
              }
            }
          }
        }
      }
    }
  }
} // end function

/**
 * generate a SceneObject that is a fun little starfish looking guy.
 */
function generate_starfish(gl) {
  // construct the hierarchy as a SceneObject
  const object = new SceneObject("starfish", gl, basic_vert_shader, basic_frag_shader);

  const json = {} // for dynamically creating this instead of doing by hand.
  json["starfish"] = {}

  // generate the base.
  let verts_and_indices = gen_sphere_points(); // the vertices to start with
  let colors = gen_sphere_colors(verts_and_indices.vertices.length, [1, 0.5, 0.6]);
  let static_transforms = [scale([0.5, 0.5, 0.5])];

  // make this a scene node.
  const base = new SceneObjectNode("base", verts_and_indices, colors, static_transforms, gl, object.program);
  json["starfish"]["base"] = {}
  json["starfish"]["base"]["dynamic_transforms"] = [];
  json["starfish"]["base"]["joint_transforms"] = [];

  // make some tentacles, returning the root node of this structure
  const num_tentacles = 4;
  const translates = [[-2, 0, -2], [0, 2, -2], [2, 0, -2], [0, -2, -2]]
  for (let i = 0; i < num_tentacles; i++) {
    const [json_child, root_child_node] = generate_tentacle(gl, i, translates[i], object.program)
    json["starfish"]["base"][root_child_node.id] = json_child // add to this json
    base.add_child(root_child_node); // add child to this base.
  } // end loop

  // add base as the root.
  object.add_root(base);

  return [json, object]
} // end function

/**
 * make a single tentacle
 */
function generate_tentacle(gl, id, translate_val, program) {
  // constructing a tree of tentacles, all the same node.
  const json = {} // dynamic json creation.
  
  // generate the next segment.
  verts_and_indices = gen_sphere_points(); // the vertices to start with
  colors = gen_sphere_colors(verts_and_indices.vertices.length, [1, 0.7, 0.8]);
  static_transforms = [scale([0.8, 0.8, 0.8]), translate(translate_val)];

  // make this a scene node.
  const base = new SceneObjectNode(`base_${id}`, verts_and_indices, colors, static_transforms, gl, program);
  // json[base.id] = {};
  json["dynamic_transforms"] = [];
  json["joint_transforms"] = [];

  // generate the next segment.
  verts_and_indices = gen_sphere_points(); // the vertices to start with
  colors = gen_sphere_colors(verts_and_indices.vertices.length, [1, 0.7, 0.8]);
  static_transforms = [scale([0.8, 0.8, 0.8]), translate(translate_val)];

  // make this a scene node.
  const seg1 = new SceneObjectNode(`seg1_${id}`, verts_and_indices, colors, static_transforms, gl, program);
  json[seg1.id] = {};
  json[seg1.id]["dynamic_transforms"] = [];
  json[seg1.id]["joint_transforms"] = [];

  // generate the next segment.
  verts_and_indices = gen_sphere_points(); // the vertices to start with
  colors = gen_sphere_colors(verts_and_indices.vertices.length, [1, 0.7, 0.8]);
  static_transforms = [scale([0.8, 0.8, 0.8]), translate(translate_val)];

  // make this a scene node.
  const seg2 = new SceneObjectNode(`seg2_${id}`, verts_and_indices, colors, static_transforms, gl, program);
  json[seg1.id][seg2.id] = {};
  json[seg1.id][seg2.id]["dynamic_transforms"] = [];
  json[seg1.id][seg2.id]["joint_transforms"] = [];

  verts_and_indices = gen_sphere_points(); // the vertices to start with
  colors = gen_sphere_colors(verts_and_indices.vertices.length, [1, 1, 1]);
  static_transforms = [scale([0.8, 0.8, 0.8]), translate(translate_val)];

  // make this a scene node.
  const top = new SceneObjectNode(`top_${id}`, verts_and_indices, colors, static_transforms, gl, program);
  json[seg1.id][seg2.id][top.id] = {};
  json[seg1.id][seg2.id][top.id]["dynamic_transforms"] = [];
  json[seg1.id][seg2.id][top.id]["joint_transforms"] = [];

  // set up the hierarchy
  base.add_child(seg1);
  seg1.add_child(seg2);
  seg2.add_child(top);

  return [json, base];
} // end function