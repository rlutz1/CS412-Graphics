/*
  4 inward pointing triangles to create a square. 
  4 are used instead of 2 to create a specific color 
  matching pattern.
 */
const positions = new Float32Array([
    // bottom triangle
    -1.0, -1.0, 0.0, // bottom left
    1.0, -1.0, 0.0,  // bottom right
    0.0, 0.0, 0.0,   // middle

    // left triangle
    -1.0, -1.0, 0.0, // bottom left
    -1.0, 1.0, 0.0,  // top left 
    0.0, 0.0, 0.0,   // middle
    
    // top triangle
    -1.0, 1.0, 0.0, // top left
    1.0, 1.0, 0.0,  // top right
    0.0, 0.0, 0.0,  // middle

    // right triangle
    1.0, -1.0, 0.0, // bottom right
    1.0, 1.0, 0.0,  // top right
    0.0, 0.0, 0.0,  // middle

]);

/*
  groups of 3 color vertices.
  each group is the vertex colors of
  one of the 4 trianges.
 */

// declare some colors up here to ease the pain of changing.
const bottom_left_color =  [1.0, 0.0, 1.0]
const bottom_right_color = [1.0, 1.0, 0.0]
const middle_color =       [0.0, 1.0, 1.0]
const top_left_color = bottom_right_color // want these to match
const top_right_color = bottom_left_color // want these to match


// add all colors together to match each triangle
const colors = new Float32Array([
  // bottom triangle
  ...bottom_left_color,   // bottom left
  ...bottom_right_color,  // bottom right
  ...middle_color,        // middle
  
  // left triangle
  ...bottom_left_color,   // bottom left
  ...top_left_color,      // top left
  ...middle_color,        // middle
  
  // top triangle
  ...top_left_color,      // top left
  ...top_right_color,     // top right
  ...middle_color,        // middle

  // right
  ...bottom_right_color,  // bottom right
  ...top_right_color,     // top right
  ...middle_color,        // middle

]);
