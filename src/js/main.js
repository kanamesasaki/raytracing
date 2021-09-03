import { getVertexShader, getFragmentShader } from './utils.js'
import { Camera } from './camera.js'

// Global variables that are set and used
// across the application
let gl
let program
let squareVertexBuffer
let camera
const canvas = document.getElementById('webgl-canvas')

// We call draw to render to our canvas
function draw() {
  // Clear the scene
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  // GLuint index: index of the generic vertex attribute
  // GLint size: number of components per generic vertex attribute, 1~4
  // GLenum type: data type of each component in the array
  // GLboolean normalized: 
  // GLsizei stride: byte offset between consecutive generic vertex attributes
  // const void * pointer: offset of the first component of the first generic vertex attribute in the array
  gl.enableVertexAttribArray(program.aVertexPosition);
  // GLuint index: index of the generic vertex attribute to be enabled

  // Draw to the scene using triangle primitives from array data
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  // GLenum mode: primitive type
  // GLint first: starting index
  // GLsizei count: number of indices

  // Clean
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function redraw() {
  canvas.width = window.innerWidth; // window.innerWidth;
  canvas.height = window.innerHeight; // window.innerHeight;
  draw()
}

// Entry point to our application
function init() {
  // Retrieve the canvas

  // Set the canvas to the size of the screen
  canvas.width = window.innerWidth; // window.innerWidth;
  canvas.height = window.innerHeight; // window.innerHeight;

  // Retrieve a WebGL context
  gl = canvas.getContext('webgl2')
  // Set the clear color to be black
  gl.clearColor(0, 0, 0, 1);

  // Call the functions in an appropriate order
  const vertexShader = getVertexShader(gl);
  const fragmentShader = getFragmentShader(gl);

  // Create a program
  program = gl.createProgram();
  // Attach the shaders to this program
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Could not initialize shaders');
  }

  // Use this program instance
  gl.useProgram(program);
  // We attach the location of these shader values to the program instance
  // for easy access later in the code
  program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
  program.aVertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");
  console.log('aVertexPosition', program.aVertexPosition);
  console.log('aVertexColorAttribute', program.aVertexColorAttribute);

  camera = new Camera();
  camera.setPosition(0.0, 0.0, 10.0);
  program.uCameraMatrix = gl.getUniformLocation(program, 'uCameraMatrix');
  gl.uniformMatrix4fv(program.uCameraMatrix, false, camera.matrix);

  const { width, height } = canvas;
  program.uInverseTextureSize = gl.getUniformLocation(program, 'uInverseTextureSize');
  gl.uniform2f(program.uInverseTextureSize, 1/width, 1/height);
  console.log('width', width);
  console.log('height', height);
  
  // init buffer for the ray tracing
  /*
    (-1, 1, 0)        (1, 1, 0)
    X---------------------X
    |                     |
    |                     |
    |       (0, 0)        |
    |                     |
    |                     |
    X---------------------X
    (-1, -1, 0)       (1, -1, 0)
  */
  const vertices = [
    -1, -1, 0,
    1, -1, 0,
    -1, 1, 0,
    -1, 1, 0,
    1, -1, 0,
    1, 1, 0
  ]

  // Init the VBO
  squareVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Clean up the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  // draw geometry
  draw();
}

document.getElementById("btn1").onclick = function() {
  // console.log('rotate Y +10')
  camera.rotateY(Math.PI/180.0*10.0);
  gl.uniformMatrix4fv(program.uCameraMatrix, false, camera.matrix);
  draw();
}

document.getElementById("btn2").onclick = function() {
  // console.log('rotate Y -10')
  camera.rotateY(-Math.PI/180.0*10.0);
  gl.uniformMatrix4fv(program.uCameraMatrix, false, camera.matrix);
  draw();
}

document.getElementById("btn3").onclick = function() {
  // console.log('rotate X +10')
  camera.rotateX(Math.PI/180.0*10.0);
  gl.uniformMatrix4fv(program.uCameraMatrix, false, camera.matrix);
  draw();
}

document.getElementById("btn4").onclick = function() {
  // console.log('rotate X -10')
  camera.rotateX(-Math.PI/180.0*10.0);
  gl.uniformMatrix4fv(program.uCameraMatrix, false, camera.matrix);
  draw();
}

// Call init once the webpage has loaded
window.onload = init;
window.addEventListener('resize', redraw);