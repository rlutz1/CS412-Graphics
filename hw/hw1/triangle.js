// square
// const positions = new Float32Array([
//     0.0,  1.0,   // vertex 1
//     1.0,  0.0,   // vertex 2
//    -1.0,  0.0,   // vertex 3
//     0.0, -1.0    // vertex 4
// ]);

// turns back to triangle
const positions = new Float32Array([
    // -1.0,  1.0, 0.0,  // top left
    -1.0, -1.0, 0.0, // bottom left

    1.0, -1.0, 0.0,   // bottom right
    0.0, 0.0, 0.0, // middle

    // 1.0, -1.0, 0.0, // bottom right
    -1.0, 0.5, 0.0 // top right
    // 1.0,  1.0, 0.0,  // top right
     
    // -0.5, 0.5, 0.0,
    // 0.0, 0.0, 0.0
   
    //  -1.0,  1.0, 0.0

  //   0.0, -1.0, 0.0,   // vertex 4
  //  -1.0,  0.0, 0.0,  // vertex 3
  //   0.0, 0.0, 0.0,
    
  //   // 0.0, 0.0, 0.0,
  //   0.0, 1.0, 0.0,
  //    0.0, 1.0, 0.0
    
]);


// acheives full rotation to all vertices as desired but
// still with fade to black.
const colors = new Float32Array([
  1.0, 0.0, 0.0,  // red
  0.0, 1.0, 0.0,  // green
  0.0, 0.0, 1.0,   // blue
  1.0, 0.0, 0.0   // red
  // 0.0, 1.0, 0.0
]);

// 
// const colors = new Float32Array([
//   1.0, -1.0, -1.0,  // g
//   -1.0, 1.0, -1.0,  // red -> blue -> black
//   -1.0, -1.0, 1.0   // blue -> green -> black
// ]);
// this is something
// const colors = new Float32Array([
//   0.1, 0.6, 1.0,  // green -> red -> black
//   1.0, 0.1, 0.6,  // red -> blue -> black
//   0.6, 1.0, 0.1   // blue -> green -> black
// ]);
