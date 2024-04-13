var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float a_Size;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = a_Size;
    }`;

var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`;


let canvas, gl;
let a_Position, u_FragColor, a_Size;
let redSlider, greenSlider, blueSlider;
let drawMode = 1;

function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
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

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    a_Size = gl.getUniformLocation(gl.program, 'a_Size');
    if (!a_Size) {
        console.log('Failed to get the storage location of a_Size');
        return;
    }
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();

    canvas.onmousedown = click;
    canvas.onmousemove = click;
    redSlider = document.getElementById("redSlider");
    greenSlider = document.getElementById("greenSlider");
    blueSlider = document.getElementById("blueSlider");

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}



function convertCoordinatesToGL(ev) {
    var x = ev.clientX; 
    var y = ev.clientY; 
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return ([x, y]);
}

function renderAllShapes() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapes.length;
    for(var i = 0; i < len; i++) {
        g_shapes[i].render();
    }
}

var g_shapes = [];
function click(ev) {
    if (ev.buttons != 1)
        return;
    
    let [x, y] = convertCoordinatesToGL(ev);

    let r = redSlider.value / 100;
    let g = greenSlider.value / 100;
    let b = blueSlider.value / 100;

    let size = document.getElementById("shapeSizeSlider").value;

    switch(drawMode) {
        case 1:
            g_shapes.push(new Point([x, y], [r, g, b, 1.0], size));
            break;
        case 3:
            g_shapes.push(new Triangle([x, y], [r, g, b, 1.0], size));
            break;
        case 4:
            let segments = mapSliderToMultiplesOf360();
            g_shapes.push(new Circle([x, y], [r, g, b, 1.0], size, segments));
            break;
    }

    renderAllShapes();
}

function clearCanvas() {
    g_shapes = [];
    renderAllShapes();
}

function SetDrawMode(mode) {
    drawMode = mode;
}

//im using 36 as the number of segments for a perfect circle
//allowing every number from 3 to 36 in the slider can occasionally cause 
//weird issues if the number isnt a perfect multiple of 360 
//(maybe because I chose to use gl.TRIANGLE_FAN instead of gl.TRIANGLES like in the videos)
//because of this, the slider has values 1 to 16, and i map them to all multiples of 360 less than 36 and greater than 3
//3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36
//1, 2, 3, 4, 5, 6,  7,  8,  9, 10, 11, 12, 13, 14
function mapSliderToMultiplesOf360() {
    let sliderVal = Number(document.getElementById("segmentSlider").value);
    if (sliderVal <= 4)
        return sliderVal + 2;

    switch (sliderVal) {
        case 5: return 8;
        case 6: return 9;
        case 7: return 10;
        case 8: return 12;
        case 9: return 15;
        case 10: return 18;
        case 11: return 20;
        case 12: return 24;
        case 13: return 30;
        case 14: return 36;
    }
}

 
