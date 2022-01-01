import { getVertexShader, getFragmentShader } from './utils.js'
import { Camera } from './camera.js'
import { Rectangle } from './rectangle.js'
import { Triangle } from './triangle.js'
import { Sphere } from './sphere.js'
import { Disk } from './disk.js'
import { Cylinder } from './cylinder.js'
import { Cone } from './cone.js'
import { Paraboloid } from './paraboloid.js'

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

function hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16)/255.0, parseInt(result[2], 16)/255.0, parseInt(result[3], 16)/255.0] : null;
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

// Sphere dialog
let spheres = []
let numSphere = 0
let dialogSphere = document.getElementById("sphere-dialog-panel")
document.getElementById("sphere-dialog-open").onclick = function() {
  dialogSphere.showModal();
}
document.getElementById("sphere-dialog-cancel").onclick = function() {
  dialogSphere.close('cancel');
}
document.getElementById("sphere-dialog-ok").onclick = function() {
  // get elements from the dialog
  let p1_x = document.getElementById('sphere-p1-x');
  let p1_y = document.getElementById('sphere-p1-y');
  let p1_z = document.getElementById('sphere-p1-z');
  let p2_x = document.getElementById('sphere-p2-x');
  let p2_y = document.getElementById('sphere-p2-y');
  let p2_z = document.getElementById('sphere-p2-z');
  let p3_x = document.getElementById('sphere-p3-x');
  let p3_y = document.getElementById('sphere-p3-y');
  let p3_z = document.getElementById('sphere-p3-z');
  let radius = document.getElementById('sphere-radius');
  let start_angle = document.getElementById('sphere-start_angle');
  let end_angle = document.getElementById('sphere-end_angle');
  let apex_truncation = document.getElementById('sphere-apex_truncation');
  let base_truncation = document.getElementById('sphere-base_truncation');
  let color = document.getElementById('sphere-color');
  // set sphere parameters 
  let item = new Sphere();
  item.setP1(p1_x.value, p1_y.value, p1_z.value);
  item.setP2(p2_x.value, p2_y.value, p2_z.value);
  item.setP3(p3_x.value, p3_y.value, p3_z.value);
  item.setRadius(radius.value)
  item.setAngles(start_angle.value*Math.PI/180.0, end_angle.value*Math.PI/180.0)
  item.setTruncations(apex_truncation.value, base_truncation.value)
  item.setColor(hexToRgb(color.value))
  spheres.push(item);
  spheres[numSphere].pushToShader(numSphere, gl, program);
  numSphere += 1;
  let numLoc = gl.getUniformLocation(program, 'numSphere');
  gl.uniform1i(numLoc, numSphere);
  dialogSphere.close('ok');
}

// rectangle dialog
let rectangles = []
let numRectangle = 0
let dialogRectangle = document.getElementById("rectangle-dialog-panel");
document.getElementById("rectangle-dialog-open").onclick = function() {
  dialogRectangle.showModal();
}
document.getElementById("rectangle-dialog-cancel").onclick = function() {
  dialogRectangle.close('cancel');
}
document.getElementById("rectangle-dialog-ok").onclick = function() {
  // get elements from the dialog
  let p1_x = document.getElementById('rectangle-p1-x');
  let p1_y = document.getElementById('rectangle-p1-y');
  let p1_z = document.getElementById('rectangle-p1-z');
  let p2_x = document.getElementById('rectangle-p2-x');
  let p2_y = document.getElementById('rectangle-p2-y');
  let p2_z = document.getElementById('rectangle-p2-z');
  let p3_x = document.getElementById('rectangle-p3-x');
  let p3_y = document.getElementById('rectangle-p3-y');
  let p3_z = document.getElementById('rectangle-p3-z');
  let color = document.getElementById('rectangle-color');
  // set rectangle parameters 
  let rect = new Rectangle();
  rect.setP1(p1_x.value, p1_y.value, p1_z.value);
  rect.setP2(p2_x.value, p2_y.value, p2_z.value);
  rect.setP3(p3_x.value, p3_y.value, p3_z.value);
  rect.setColor(hexToRgb(color.value));
  rectangles.push(rect);
  rectangles[numRectangle].pushToShader(numRectangle, gl, program);
  numRectangle += 1;
  let numLoc = gl.getUniformLocation(program, 'numRectangle');
  gl.uniform1i(numLoc, numRectangle);
  dialogRectangle.close('ok');
}

// triangle dialog
let triangles = []
let numTriangle = 0
let dialogTriangle = document.getElementById("triangle-dialog-panel")
document.getElementById("triangle-dialog-open").onclick = function() {
  dialogTriangle.showModal();
}
document.getElementById("triangle-dialog-cancel").onclick = function() {
  dialogTriangle.close('cancel');
}
document.getElementById("triangle-dialog-ok").onclick = function() {
  // get elements from the dialog
  let p1_x = document.getElementById('triangle-p1-x');
  let p1_y = document.getElementById('triangle-p1-y');
  let p1_z = document.getElementById('triangle-p1-z');
  let p2_x = document.getElementById('triangle-p2-x');
  let p2_y = document.getElementById('triangle-p2-y');
  let p2_z = document.getElementById('triangle-p2-z');
  let p3_x = document.getElementById('triangle-p3-x');
  let p3_y = document.getElementById('triangle-p3-y');
  let p3_z = document.getElementById('triangle-p3-z');
  let color = document.getElementById('triangle-color');
  // set triangle parameters 
  let item = new Triangle();
  item.setP1(p1_x.value, p1_y.value, p1_z.value);
  item.setP2(p2_x.value, p2_y.value, p2_z.value);
  item.setP3(p3_x.value, p3_y.value, p3_z.value);
  item.setColor(hexToRgb(color.value));
  triangles.push(item);
  triangles[numTriangle].pushToShader(numTriangle, gl, program);
  numTriangle += 1;
  let numLoc = gl.getUniformLocation(program, 'numTriangle');
  gl.uniform1i(numLoc, numTriangle);
  dialogTriangle.close('ok');
}

// disk dialog
let disks = []
let numDisk = 0
let dialogDisk = document.getElementById("disk-dialog-panel")
document.getElementById("disk-dialog-open").onclick = function() {
  dialogDisk.showModal();
}
document.getElementById("disk-dialog-cancel").onclick = function() {
  dialogDisk.close('cancel');
}
document.getElementById("disk-dialog-ok").onclick = function() {
  // get elements from the dialog
  let p1_x = document.getElementById('disk-p1-x');
  let p1_y = document.getElementById('disk-p1-y');
  let p1_z = document.getElementById('disk-p1-z');
  let p2_x = document.getElementById('disk-p2-x');
  let p2_y = document.getElementById('disk-p2-y');
  let p2_z = document.getElementById('disk-p2-z');
  let p3_x = document.getElementById('disk-p3-x');
  let p3_y = document.getElementById('disk-p3-y');
  let p3_z = document.getElementById('disk-p3-z');
  let outer_radius = document.getElementById('disk-outer_radius');
  let inner_radius = document.getElementById('disk-inner_radius');
  let start_angle = document.getElementById('disk-start_angle');
  let end_angle = document.getElementById('disk-end_angle');
  let color = document.getElementById('disk-color');
  // set disk parameters 
  let item = new Disk();
  item.setP1(p1_x.value, p1_y.value, p1_z.value);
  item.setP2(p2_x.value, p2_y.value, p2_z.value);
  item.setP3(p3_x.value, p3_y.value, p3_z.value);
  item.setRadius(outer_radius.value, inner_radius.value)
  item.setAngles(start_angle.value*Math.PI/180.0, end_angle.value*Math.PI/180.0)
  item.setColor(hexToRgb(color.value));
  disks.push(item);
  disks[numDisk].pushToShader(numDisk, gl, program);
  numDisk += 1;
  let numLoc = gl.getUniformLocation(program, 'numDisk');
  gl.uniform1i(numLoc, numDisk);
  dialogDisk.close('ok');
}

// cylinder dialog
let cylinders = []
let numCylinder = 0
let dialogCylinder = document.getElementById("cylinder-dialog-panel")
document.getElementById("cylinder-dialog-open").onclick = function() {
  dialogCylinder.showModal();
}
document.getElementById("cylinder-dialog-cancel").onclick = function() {
  dialogCylinder.close('cancel');
}
document.getElementById("cylinder-dialog-ok").onclick = function() {
  // get elements from the dialog
  let p1_x = document.getElementById('cylinder-p1-x');
  let p1_y = document.getElementById('cylinder-p1-y');
  let p1_z = document.getElementById('cylinder-p1-z');
  let p2_x = document.getElementById('cylinder-p2-x');
  let p2_y = document.getElementById('cylinder-p2-y');
  let p2_z = document.getElementById('cylinder-p2-z');
  let p3_x = document.getElementById('cylinder-p3-x');
  let p3_y = document.getElementById('cylinder-p3-y');
  let p3_z = document.getElementById('cylinder-p3-z');
  let radius = document.getElementById('cylinder-radius');
  let start_angle = document.getElementById('cylinder-start_angle');
  let end_angle = document.getElementById('cylinder-end_angle');
  let color = document.getElementById('cylinder-color');
  // set cylinder parameters 
  let item = new Cylinder();
  item.setP1(p1_x.value, p1_y.value, p1_z.value);
  item.setP2(p2_x.value, p2_y.value, p2_z.value);
  item.setP3(p3_x.value, p3_y.value, p3_z.value);
  item.setRadius(radius.value)
  item.setAngles(start_angle.value*Math.PI/180.0, end_angle.value*Math.PI/180.0)
  item.setColor(hexToRgb(color.value));
  cylinders.push(item);
  cylinders[numCylinder].pushToShader(numCylinder, gl, program);
  numCylinder += 1;
  let numLoc = gl.getUniformLocation(program, 'numCylinder');
  gl.uniform1i(numLoc, numCylinder);
  dialogCylinder.close('ok');
}

// cone dialog
let cones = []
let numCone = 0
let dialogCone = document.getElementById("cone-dialog-panel")
document.getElementById("cone-dialog-open").onclick = function() {
  dialogCone.showModal();
}
document.getElementById("cone-dialog-cancel").onclick = function() {
  dialogCone.close('cancel');
}
document.getElementById("cone-dialog-ok").onclick = function() {
  // get elements from the dialog
  let p1_x = document.getElementById('cone-p1-x');
  let p1_y = document.getElementById('cone-p1-y');
  let p1_z = document.getElementById('cone-p1-z');
  let p2_x = document.getElementById('cone-p2-x');
  let p2_y = document.getElementById('cone-p2-y');
  let p2_z = document.getElementById('cone-p2-z');
  let p3_x = document.getElementById('cone-p3-x');
  let p3_y = document.getElementById('cone-p3-y');
  let p3_z = document.getElementById('cone-p3-z');
  let radius1 = document.getElementById('cone-radius1');
  let radius2 = document.getElementById('cone-radius2');
  let start_angle = document.getElementById('cone-start_angle');
  let end_angle = document.getElementById('cone-end_angle');
  let color = document.getElementById('cone-color');
  // set cone parameters 
  let item = new Cone();
  item.setP1(p1_x.value, p1_y.value, p1_z.value);
  item.setP2(p2_x.value, p2_y.value, p2_z.value);
  item.setP3(p3_x.value, p3_y.value, p3_z.value);
  item.setRadius(radius1.value, radius2.value)
  item.setAngles(start_angle.value*Math.PI/180.0, end_angle.value*Math.PI/180.0)
  item.setColor(hexToRgb(color.value));
  cones.push(item);
  cones[numCone].pushToShader(numCone, gl, program);
  numCone += 1;
  let numLoc = gl.getUniformLocation(program, 'numCone');
  gl.uniform1i(numLoc, numCone);
  dialogCone.close('ok');
}

// paraboloid dialog
let paraboloids = []
let numParaboloid = 0
let dialogParaboloid = document.getElementById("paraboloid-dialog-panel")
document.getElementById("paraboloid-dialog-open").onclick = function() {
  dialogParaboloid.showModal();
}
document.getElementById("paraboloid-dialog-cancel").onclick = function() {
  dialogParaboloid.close('cancel');
}
document.getElementById("paraboloid-dialog-ok").onclick = function() {
  // get elements from the dialog
  let p1_x = document.getElementById('paraboloid-p1-x');
  let p1_y = document.getElementById('paraboloid-p1-y');
  let p1_z = document.getElementById('paraboloid-p1-z');
  let p2_x = document.getElementById('paraboloid-p2-x');
  let p2_y = document.getElementById('paraboloid-p2-y');
  let p2_z = document.getElementById('paraboloid-p2-z');
  let p3_x = document.getElementById('paraboloid-p3-x');
  let p3_y = document.getElementById('paraboloid-p3-y');
  let p3_z = document.getElementById('paraboloid-p3-z');
  let radius = document.getElementById('paraboloid-radius');
  let apex_truncation = document.getElementById('paraboloid-apex_truncation');
  let start_angle = document.getElementById('paraboloid-start_angle');
  let end_angle = document.getElementById('paraboloid-end_angle');
  let color = document.getElementById('paraboloid-color');
  // set paraboloid parameters 
  let item = new Paraboloid();
  item.setP1(p1_x.value, p1_y.value, p1_z.value);
  item.setP2(p2_x.value, p2_y.value, p2_z.value);
  item.setP3(p3_x.value, p3_y.value, p3_z.value);
  item.setRadius(radius.value)
  item.setRadius(apex_truncation.value)
  item.setAngles(start_angle.value*Math.PI/180.0, end_angle.value*Math.PI/180.0)
  item.setColor(hexToRgb(color.value));
  paraboloids.push(item);
  paraboloids[numParaboloid].pushToShader(numParaboloid, gl, program);
  numParaboloid += 1;
  let numLoc = gl.getUniformLocation(program, 'numParaboloid');
  gl.uniform1i(numLoc, numParaboloid);
  dialogParaboloid.close('ok');
}


document.getElementById("paraboloid-dialog-open").onclick = function() {
  let dialog = document.getElementById("paraboloid-dialog-panel");
  dialog.showModal();
  let cancel = document.getElementById('paraboloid-dialog-cancel');
  cancel.addEventListener('click', () => {
    dialog.close('cancel');
  });
  let ok = document.getElementById('paraboloid-dialog-ok');
  ok.addEventListener('click', () => {
    dialog.close('ok');
  });
}

// Call init once the webpage has loaded
window.onload = init;
window.addEventListener('resize', redraw);