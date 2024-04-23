var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotationMatrix;
    varying vec4 v_Color;
    void main() {
        gl_Position = u_GlobalRotationMatrix * u_ModelMatrix * a_Position;
        v_Color = a_Color;
    }`;

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
        gl_FragColor = v_Color;
    }`;


let canvas, gl;
let a_Position, a_Color, u_ModelMatrix, u_GlobalRotationMatrix;
let globalRotx, globalRoty, globalRotz;
let drawMode = 1;
let xSlider, ySlider, zSlider;

function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (!a_Color) {
        console.log('Failed to get the storage location of v_Color');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotationMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotationMatrix');
    if (!u_GlobalRotationMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotationMatrix');
        return;
    }
}

let c, m;
let glob;
function main() {
    setupWebGL();
    connectVariablesToGLSL();

    //adding a mousemove event listener causes the cube to only start rendering after like 20 seconds
    //doing it this method causes no delay
    xSlider = document.getElementById("xSlider");
    ySlider = document.getElementById("ySlider");
    zSlider = document.getElementById("zSlider");

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    m = new Matrix4();
    glob = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, glob.elements);
    // m.setRotate(45, 0, 0, 0);
    m.setScale(0.5, 0.5, 0.5);
    m.translate(-0.5, -0.5, 0);
    //m.rotate(45, 1, 1, 0)
    c = new Cube([1, 1, 1, 1], m);
    //c.render();
    g_shapes.push(c);
    renderAllShapes();
    //rot();
}

let g_shapes = [];
function renderAllShapes() {
    console.log("here")
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    glob.setRotate(xSlider.value, 1, 0, 0);
    glob.rotate(ySlider.value, 0, 1, 0);
    glob.rotate(zSlider.value, 0, 0, 1);
    gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, glob.elements);

    var len = g_shapes.length;
    for(var i = 0; i < len; i++) {
        g_shapes[i].render();
    }
}

