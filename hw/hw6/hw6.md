# HW 5

## instructions 

In this assignment, you are expected to create objects with texture mapping. You can create new object, new scene, or keeping use the objects you have created in your previous assignments.

- [ ] Texture Mapping on Different Objects (6 pts)
  - [ ] Implement at least 3 new geometric primitives with textures (you can use the existing brick texture or any texture you like) on them, including at least 2 curved primitives (choose from cone, sphere, torus).

- [ ] Textures with Animations (2pts)
  - [ ] At least one of the textures has animation (e.g. GIF, video) (can be one of the above three textures)

- [ ] Bump/Normal Mapping (4pts)
   - [ ] Implement at least one additional normal mapping (you can use the existing brick texture or any texture you like, it can be one of the three objects in task 1)
   - [ ] Implement at least one additional bump mapping (you can use the existing brick texture or any texture you like, it can be one of the three objects in task 1)

- [ ] Creativity and Design (+1 bonus pt)
  - [ ] Outstanding effects and creativities

- [ ] Correct submission format: (0 pt, but you will get -1 pt penalty if you fail to do it)

- [ ] Your homework must be hosted on GitHub Pages (or another hosting service) so we can run it directly. Please submit the GitHub Pages link that opens your scene right away, not the link to your GitHub repository.

```
Note:

Modern browsers block WebGL from loading texture images when you open your HTML file directly from your computer (a file:// path). This is a browser security restriction, not a bug in your code. It usually shows up as a black or missing texture with a CORS error in the browser console.

This is another reason why you need to host your homework assignment online. Once your project is on GitHub Pages, your HTML file and texture images are served from the same website, so the browser loads them without any problem. To set this up:

    Put your HTML, JavaScript, and texture images in a GitHub repository.
    Enable GitHub Pages for that repository (https://docs.github.com/en/pages).
    Load textures with relative paths, such as textures/brick.jpg.
    Open your GitHub Pages link (e.g., https://username.github.io/repo-name/) and make sure everything renders correctly.

Changes may take a minute or two to appear after you push.

For developing, you can also test locally by running a simple server in your project folder:

python3 -m http.server

Then open http://localhost:8000 in your browser.
```


![steps with opengl](images/image.png)