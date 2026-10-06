# HW 4

In this assignment, you will need to build hierarchical models with the primitives you learned.

1. Hierarchical Structures (2 pts):
  + Create a hierarchical model with at least four levels (including the base/root segment). (2 pts)

2. Model Movements (4 pts):
  + At least three levels need to have movements. (2 pts)
  + Implement at least two UI elements that can control the chained movements. (2 pts)
  + You can reproduce a robotic arm like the class demo (base->lower arm-> upper arm->hand). 

3. Outstanding effects and creativities will get 1 bonus points. (+1 pts)

4. If you plan to submission by uploading files, you need to zip the folder (put your name as part of the folder name) containing all required code, and upload the zipped file. If you plan to submit URL of a GitHub webpage, make sure you don't edit your online repo after the deadline because the timpstamp of the last edit will be considered as the submission time.

## notes dump

general flow for distinct objects:

[read me](https://stackoverflow.com/questions/28614956/webgl-adding-multiple-objects-to-one-canvas)

[also](https://webglfundamentals.org/webgl/lessons/webgl-drawing-multiple-things.html)

```
use program for cube // only if they have different shaders!
set attributes for cube
set uniforms for cube
draw cube

use program for tetrahedon
set attributes for tetrahedon
set uniforms for tetrahedon
draw tetrahedon

use program for sphere
set attributes for sphere
set uniforms for sphere
draw sphere
```

## todo list
+ pass on a pos & color attrib location at minimum (the two in's of the basic vert shader.)
  + would like for to be flexible, but if hardcoded for testing, is fine.