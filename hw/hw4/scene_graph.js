/**
 * this file holds the definition of the scene graph components.
 * this is organized in such a way to enable batching by programs
 * and hierarchical modelling.
 */

/**
 * ============================================================
 * SCENE GRAPH
 * 
 * this is the root of the scene show in any canvas. 
 * it is really an encapsulation on a list of root objects in the scene
 * and holds some global values to be passed on render
 * to enable automation of a scene build.
 * ============================================================
 */

class SceneGraph {

  objects = []; // these are root objects of the scene. can be a single node.
  transform_dict = {}; // this holds mappings of object/node id -> transformations.
                       // this should be dynamically generated from front depending on desired effects.
  canvas = null; // a ref to the associated canvas. likely mostly for debugging as needed.

  projection = null; 
  model_view = null;

  /**
   * ----------------------------------
   * constructor
   * ----------------------------------
   */
  constructor(canvas) {
    if (canvas == null) { // CANNOT be null because need gl from it.
      throw new Error("ERROR: canvas passed to SceneGraph cannot be null!");
    } // end if

    // this.transform_dict = transform_dict;
    this.canvas = canvas;
    this.gl = this.canvas.getContext("webgl2");

    // init the graph.
    this.init();
  } // end constructor

  /**
   * initialize the projection and model view of this scene.
   */
  init() {
    // clear out gl 
    this.clear()

    // projection setup
    const fov = Math.PI / 4;
    const aspect = this.canvas.width / this.canvas.height
    const zNear = 0.1; 
    const zFar = 100;
    const orthoSize = 2.5;

    // perspective and orthographic projection
    const projPerspective = perspective(fov, aspect, zNear, zFar);

    const projOrtho = matMul(
      box2Cube(-orthoSize * aspect, orthoSize * aspect, -orthoSize, orthoSize, zNear, zFar),
      flipZ()
    );
    const projection = projOrtho;

    // init model-view matrix as identity matrix
    const model_view = mat4Identity();
    
    // return the general projection/model_view matrices for the scene.
    this.projection = projection;
    this.model_view = model_view;

    // init model transformation matrix as identity matrix
    // let modelTransformationMatrix = mat4Identity(); // TODO: this should be from the node

    /*
    THIS IS WHAT HAPPENS ON RENDER FOR REFERENCE.
      time = deltaTime/1000.0
    //gl.uniform1f(timeLoc, time);
    gl.uniformMatrix4fv(uPM, false, proj);
    gl.uniformMatrix4fv(uMVM, false, modelViewMatrix);
    gl.uniformMatrix4fv(uMTM, false, modelTransformationMatrix);
    gl.uniformMatrix4fv(transformation, false, get_transform_matrix(get_all_transforms("transforms"), time))
    */
    } // end init

  /**
   * ----------------------------------
   * render
   * ----------------------------------
   */
  render(vertex_transforms) {
    // let's do some scene clearing work.
    this.clear();

    // simply: for each main object child, call their render function.
    this.objects.forEach((o) => {
      console.log(`Rendering ${o.id} object...`);
      // TODO: can i just put camera views on the stack?
      o.render(this.projection, this.model_view, vertex_transforms[o.id], []);
    });
  } // end render

  /**
   * ----------------------------------
   * functions
   * ----------------------------------
   */

  /**
   * clear out gl, should be used on every render call.
   */
  clear() {
    // clear things.
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  } // end function

  /**
   * add a top level object to the scene graph
   */
  add_object(object) {
    // TODO: assert same gl for both (same canvas!)
    if (object != null) {
      this.objects.push(object);
    } // end if
  } // end function

} // end class


/**
 * ============================================================
 * SCENE OBJECT
 * 
 * essentially: a grouping of nodes, hierarchically pieced together.
 * all of these should have the same shaders/program.
 * ============================================================
 */
class SceneObject {

  gl = null;

  roots = []; // list of root SceneObjectNodes that are structured as hierarchy.
  vert_shader = null;
  frag_shader = null; 
  program = null;
  id = null;

  model_view_loc = null; 
  projection_loc = null;

  // todo: add_node(SceneObjectNode, parent id)

  /**
   * ----------------------------------
   * constructor
   * TODO: give option of adding shaders here.
   * ----------------------------------
   */
  constructor(id, gl) {
    this.id = id;
    this.gl = gl; 
  } // end constructor

  /**
   * function to take in shaders and ready a program
   * that is used for all nodes within this SceneObject.
   */
  init(vert_shader, frag_shader) {
    this.init_shader_program(vert_shader, frag_shader)
  } // end function

  /**
   * ----------------------------------
   * render
   * ----------------------------------
   */

  // projection_matrix, vertex_transforms[o.id], []

  render(projection, model_view, vertex_transforms, stack) {
    // use this program
    this.gl.useProgram(this.program);

    // set gl attributes for the camera_matrices
    this.gl.uniformMatrix4fv(this.projection_loc, false, projection);
    this.gl.uniformMatrix4fv(this.model_view_loc, false, model_view);
    // gl.uniformMatrix4fv(uMTM, false, modelTransformationMatrix);

    this.roots.forEach((r) => {
      console.log(`Rendering ${r.id} node...`);
      // TODO: can i just put camera views on the stack?
      // stack is empty for now here.
      r.render(vertex_transforms[r.id], stack);
    });
  } // end render

  /**
   * add a root node to the object
   */
  add_root(node) {
    this.roots.push(node); // push as a root node
  } // end function

  /**
   * top level call function to (1) create the program 
   * and (2) switch over to using this program to render
   * this object tree.
   */
  init_shader_program(vsSource, fsSource) {
    try {
      // create the program for this object and children
      this.create_program(vsSource, fsSource);

      this.model_view_loc = this.gl.getUniformLocation(this.program, "uModelViewMatrix"); // same for all
      this.projection_loc = this.gl.getUniformLocation(this.program, "uProjectionMatrix"); // same for all
    } catch (e) { 
      console.error(e); 
    } // end try catch
  } // end function

  /**
   * create a gl program with attached shaders.
   */
  create_program(vsSource, fsSource) {
    // create the shaders
    this.vert_shader = this.create_shader(this.gl.VERTEX_SHADER, vsSource.src);
    this.frag_shader = this.create_shader(this.gl.FRAGMENT_SHADER, fsSource.src);
    // create the program for this object and children
    this.program = this.gl.createProgram();
    // attach shaders
    this.gl.attachShader(this.program, this.vert_shader);
    this.gl.attachShader(this.program, this.frag_shader);
    // link the program
    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(this.program));
    }
  } // end function

  /**
   * function to generate a shader for this object and its (optional) children.
   */
  create_shader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw new Error(this.gl.getShaderInfoLog(shader));
    }
    return shader;
  } // end function

} // end class


/**
 * ============================================================
 * SCENE NODE
 * 
 * generalized: a node to wrap in a scene object.
 * this could be an shape (cube, sphere, etc...) 
 * but is the ultimate node of the object tree. 
 * the object level is where you set the vertex/frag shaders and prog.
 * this is simply for holding points, colors, etc, and 
 * setting the final transformation in the vert shader for the
 * hierarchy.
 * ============================================================
 */
class SceneObjectNode {

  children = []; // children nodes of this node. 
  object = null;

  gl = null; // ref to gl for buffer generation

  vertices = null; // actual raw vertices of the node
  indices = null; // the indices of the above vertices to join up the triangles 
  colors = null; // the colors for each vertex
  part_transforms = null; // the PART transforms of this object -- static positioning.

  // buffers for gl for this node.
  pos_buff = null;
  indices_buff = null;
  color_buff = null;

  // these NEED, at minimum, to be set by the scene object!
  pos_loc = null;
  color_loc = null;
  tranform_loc = null;

  /**
   * ----------------------------------
   * constructor
   * ----------------------------------
   */
  constructor(id, verts_and_indices, colors, part_transforms, gl, program) {
    this.id = id;
    this.vertices = verts_and_indices.vertices;
    this.indices = verts_and_indices.indices;
    this.colors = colors;
    this.part_transforms = part_transforms;
    this.gl = gl; // todo, null check
    this.program = program;

    // grab these here for now.
    this.pos_loc = this.gl.getAttribLocation(this.program, "aPosition");
    this.color_loc = this.gl.getAttribLocation(this.program, "aColor");
    this.transform_matrix = this.gl.getUniformLocation(this.program, "uModelTransformationMatrix"); 

    // initialize the buffers from the given params.
    this.init_buffers();
  } // end constructor


  /**
   * initialize the buffers for 
   * 1. positions/vertices
   * 2. indices
   * 3. colors
   * used for drawing this node.
   */
  init_buffers() {
      this.pos_buff = this.init_buffer(this.vertices);
      this.indices_buff = this.init_buffer(this.indices, gl.ELEMENT_ARRAY_BUFFER);
      this.color_buff = this.init_buffer(this.colors)
  } // end function

  /**
   * wrapper around the creation and binding of a buffer so no steps missed!
   */
  init_buffer(data, type=this.gl.ARRAY_BUFFER, gl_hint=this.gl.STATIC_DRAW) {
      const buff = this.gl.createBuffer();
      this.gl.bindBuffer(type, buff);
      this.gl.bufferData(type, data, gl_hint);
      return buff
  } // end function


  /**
   * add a child of this node to flesh out the hierarchy tree.
   */
  add_child(node) {
    if (node != null) {
      this.children.push(node);
    } // end if
  } // end function

  /**
   * method to pull out the common functionality of drawing a single
   * main object, to be further generalized with time.
   * 
   * TODO: the attribute locations.
   * // grab vertex transform matrices from dictionary

    // push vertex transforms to stack
    // push part transforms to the stack
    // set stack transforms to attribute in the vertex shader
    // pop off my part transform
   */
  render(vertex_transforms, stack) {
    // vertex/positions buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pos_buff);
    this.gl.enableVertexAttribArray(this.pos_loc);
    this.gl.vertexAttribPointer(this.pos_loc, 3, gl.FLOAT, false, 0, 0);

    // index buffer for drawing as triangles
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices_buff);

    // color buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.color_buff);
    this.gl.enableVertexAttribArray(this.color_loc);
    this.gl.vertexAttribPointer(this.color_loc, 3, gl.FLOAT, false, 0, 0);

     // need to update the matrix with my vertex transforms, then my parts
    stack.push(vertex_transforms.vertex_transforms);
    stack.push(this.part_transforms);
   
    gl.uniformMatrix4fv(this.transform_matrix, false, new Float32Array(stack));
  
    // todo: pop my parts
    stack.pop();

    // draw the node
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

    // vertex_transforms, stack
    this.children.forEach((c) => {
      console.log(`Rendering ${c.id} node...`);
      // TODO: can i just put camera views on the stack?
      // stack is empty for now here.
      c.render(vertex_transforms[c.id], stack);
    });

  } // end method

} // end class