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

  node = null;
  children = null;
  vert_shader = null;
  frag_shader = null; 
  program = null;
  id = null;

  /**
   * ----------------------------------
   * constructor
   * ----------------------------------
   */
  constructor() {

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
class SceneNode {

  verts_and_indeces = null; // dictionary of vertex points ("vertices") and indices ("indices") 
  colors = null; // the colors of this node 
  part_transform = null;


} // end class