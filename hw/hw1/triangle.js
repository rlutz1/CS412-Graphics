// square
// const positions = new Float32Array([
//     0.0,  1.0,   // vertex 1
//     1.0,  0.0,   // vertex 2
//    -1.0,  0.0,   // vertex 3
//     0.0, -1.0    // vertex 4
// ]);

// turns back to triangle
const positions = new Float32Array([
    0.0,  1.0, 0.0,  // vertex 1
    1.0,  0.0, 0.0,  // vertex 2
   -1.0,  0.0, 0.0,  // vertex 3
    0.0, -1.0, 0.0   // vertex 4
]);


// acheives full rotation to all vertices as desired but
// still with fade to black.
const colors = new Float32Array([
  1.0, 0.0, 0.0,  // g
  0.0, 1.0, 0.0,  // red -> blue -> black
  0.0, 0.0, 1.0,   // blue -> green -> black
  1.0, 0.0, 0.0   // blue -> green -> black
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
