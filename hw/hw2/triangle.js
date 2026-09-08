/*
  single triangle only for this
 */
const positions = new Float32Array([
    // triangle
    -0.5, -0.5, 0.0, // bottom left
     0.5, -0.5, 0.0,  // bottom right
     0.0,  0.5, 0.0,   // top
]);

/*
  simple 3 vertex colors
 */

// declare some colors up here to ease the pain of changing.
const bottom_left_color =  [0.0, 0.0, 1.0]
const bottom_right_color = [0.0, 1.0, 0.0]
const top_color =          [1.0, 0.0, 0.0]

// color the vertices
const colors = new Float32Array([
  // triangle
  ...bottom_left_color,   // bottom left
  ...bottom_right_color,  // bottom right
  ...top_color,        // middle
]);
