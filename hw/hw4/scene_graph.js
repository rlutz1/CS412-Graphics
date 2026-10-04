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

  
  /**
   * ----------------------------------
   * constructor
   * ----------------------------------
   */
  constructor(transform_dict, canvas) {
    if (canvas == null) { // CANNOT be null because need gl from it.
      throw new Error("ERROR: canvas passed to SceneGraph cannot be null!");
    } // end if

    if (transform_dict == null) { // just warn for now, don't throw any error.
      console.log(`Warning: SceneGraph passed a null transform_dict on construction!`);
    } // end if

    this.transform_dict = transform_dict;
    this.canvas = canvas;
    this.gl = this.canvas.getContext("webgl2");
  } // end constructor

  /**
   * ----------------------------------
   * render
   * ----------------------------------
   */
    render(transform_dict) {
      // let's do some scene clearing work.
      const camera_views = this.init();

      // simply: for each main object child, call their render function.
      this.objects.forEach((o) => {
        console.log(`Rendering ${o.id}...`);
        // TODO: can i just put camera views on the stack?
        o.render(camera_views, transform_dict[o.id], []);
      });
    } // end render

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
      return {
        "projection": projection,
        "model_view": model_view
      }

      // init model transformation matrix as identity matrix
      // let modelTransformationMatrix = mat4Identity(); // TODO: this should be from the node

      /*
      THIS IS WHAT HAPPENS ON RENDER FOR REFERENCE.
       time = deltaTime/1000.0
      gl.uniform1f(timeLoc, time);
      gl.uniformMatrix4fv(uPM, false, proj);
      gl.uniformMatrix4fv(uMVM, false, modelViewMatrix);
      gl.uniformMatrix4fv(uMTM, false, modelTransformationMatrix);
      gl.uniformMatrix4fv(transformation, false, get_transform_matrix(get_all_transforms("transforms"), time))
      */

    } // end init

  /**
   * ----------------------------------
   * functions
   * ----------------------------------
   */

  clear() {
      // clear things.
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.clearColor(0, 0, 0, 1);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
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
  node = null;
  children = null;
  vert_shader = null;
  frag_shader = null; 
  program = null;
  id = null;

  // todo: add_node(SceneObjectNode, parent id)

  /**
   * ----------------------------------
   * constructor
   * ----------------------------------
   */
  constructor(node, children, vert_shader, frag_shader, id, gl) {

  } // end constructor

  /**
   * ----------------------------------
   * render
   * ----------------------------------
   */
  render(camera_views, transform_dict, stack) {
    // set gl attributes for the camera_matrices
    // generate vertex transform matrices from dictionary
    // push vertex transforms to stack
    // push part transforms to the stack
    // set stack transforms to attribute in the vertex shader
    // pop off my part transform

    // for each c in children:
    //  c.render(camera_views, transform_dict[c.id], stack)

  } // end render

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

  /**
   * create a gl program with attached shaders.
   */
  create_program(vsSource, fsSource) {
    // create the shaders
    this.vert_shader = create_shader(this.gl, this.gl.VERTEX_SHADER, vsSource);
    this.frag_shader = create_shader(this.gl, this.gl.FRAGMENT_SHADER, fsSource);
    // create the program for this object and children
    this.program = this.gl.createProgram();
    // attach shaders
    this.gl.attachShader(this.program, this.vert_shader);
    this.gl.attachShader(this.program, this.frag_shader);
    // link the program
    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(prog, this.gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog));
    }
    return prog;
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
      // use this program
      this.gl.useProgram(this.program);

      // set up atribute locations
      // TODO: make flexible to the vertex shader?
      posLoc = this.gl.getAttribLocation(program, "aPosition"); // node
      colorLoc = this.gl.getAttribLocation(program, "aColor"); // node
      timeLoc = this.gl.getUniformLocation(program, "uTime"); // node
      // TODO: maybe a matrix index? or UPTO this matrix?
      uMVM = this.gl.getUniformLocation(program, "uModelViewMatrix"); // same for all
      uPM = this.gl.getUniformLocation(program, "uProjectionMatrix"); // same for all
      uMTM = this.gl.getUniformLocation(program, "uModelTransformationMatrix"); // node -- because this will change
    } catch (e) { 
      console.error(e); 
    } // end try catch
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

  gl = null; // ref to gl for buffer generation

  vertices = null; // actual raw vertices of the node
  indices = null; // the indices of the above vertices to join up the triangles 
  colors = null; // the colors for each vertex
  part_transforms = null; // the PART transforms of this object -- static positioning.

  // buffers for gl for this node.
  pos_buff = null;
  indices_buff = null;
  color_buff = null;

  /**
   * ----------------------------------
   * constructor
   * ----------------------------------
   */
  constructor(id, verts_and_indices, colors, part_transforms, gl) {
    this.id = id;
    this.vertices = verts_and_indices.vertices;
    this.indices = verts_and_indices.indices;
    this.colors = colors;
    this.part_transforms = part_transforms;
    this.gl = gl; // todo, null check

    // initialize the buffers from the given params.
    init_buffers();
  } // end constructor


  /**
   * initialize the buffers for 
   * 1. positions/vertices
   * 2. indices
   * 3. colors
   * used for drawing this node.
   */
  init_buffers() {
      this.pos_buff = initBuffer(this.vertices);
      this.indices_buff = initBuffer(this.indices, gl.ELEMENT_ARRAY_BUFFER);
      this.color_buff = initBuffer(this.colors)
  } // end function

  /**
   * wrapper around the creation and binding of a buffer so no steps missed!
   */
  init_buffer(data, type=this.gl.ARRAY_BUFFER, gl_hint=this.gl.STATIC_DRAW) {
      buff = this.gl.createBuffer();
      this.gl.bindBuffer(type, buff);
      this.gl.bufferData(type, data, gl_hint);
      return buff
  } // end function

  /**
   * method to pull out the common functionality of drawing a single
   * main object, to be further generalized with time.
   * 
   * TODO: the attribute locations.
   */
  draw() {
    // vertex/positions buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pos_buff);
    this.gl.enableVertexAttribArray(posLoc);
    this.gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

    // index buffer for drawing as triangles
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices_buff);

    // color buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.color_buff);
    this.gl.enableVertexAttribArray(colorLoc);
    this.gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
  
    // draw the node
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  } // end method

} // end class