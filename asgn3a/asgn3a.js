var VSHADER_SOURCE = `
    uniform mat4 u_GlobalRotationMatrix;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ProjectionMatrix;
    uniform mat4 u_ViewMatrix;

    attribute vec4 a_Position;

    attribute vec2 a_UV;
    varying vec2 v_UV;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotationMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`;

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;

    uniform vec4 u_FragColor;

    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;

    //skybox samplers
    uniform sampler2D u_Sampler4;
    uniform sampler2D u_Sampler5;
    uniform sampler2D u_Sampler6;
    uniform sampler2D u_Sampler7;
    uniform sampler2D u_Sampler8;
    uniform sampler2D u_Sampler9;


    uniform int textureID;
    void main() {

        if (textureID == -2) {
            gl_FragColor = u_FragColor;
        } else if (textureID == -1) {
            gl_FragColor = vec4(v_UV, 1.0, 1.0);
        } else if (textureID == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        } else if (textureID == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV);
        } else if (textureID == 2) {
            gl_FragColor = texture2D(u_Sampler2, v_UV);
        } else if (textureID == 3) {
            gl_FragColor = texture2D(u_Sampler3, v_UV);
        } else if (textureID == 4) {
            gl_FragColor = texture2D(u_Sampler4, v_UV);
        } else if (textureID == 5) {
            gl_FragColor = texture2D(u_Sampler5, v_UV);
        } else if (textureID == 6) {
            gl_FragColor = texture2D(u_Sampler6, v_UV);
        } else if (textureID == 7) {
            gl_FragColor = texture2D(u_Sampler7, v_UV);
        } else if (textureID == 8) {
            gl_FragColor = texture2D(u_Sampler8, v_UV);
        } else if (textureID == 9) {
            gl_FragColor = texture2D(u_Sampler9, v_UV);
        }
        else {
            gl_FragColor = vec4(1, 0, 1, 1);
        }
        
    }`;


let canvas, gl;
let a_Position, a_Color, a_UV, textureID, u_FragColor;
let u_GlobalRotationMatrix, u_ModelMatrix, u_ProjectionMatrix, u_ViewMatrix;
let u_Sampler0, u_Sampler1, u_Sampler2, u_Sampler3;
let globalRotx, globalRoty, globalRotz;
let xSlider, ySlider, zSlider;
let fpsCounter;

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

    u_GlobalRotationMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotationMatrix');
    if (!u_GlobalRotationMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotationMatrix');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;            
    }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (!a_UV) {
        console.log('Failed to get storage location of a_UV');
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get storage location of u_sampler0');
        return;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get storage location of u_sampler1');
        return;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get storage location of u_sampler2');
        return;
    }

    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3) {
        console.log('Failed to get storage location of u_sampler3');
        return;
    }

    u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
    if (!u_Sampler4) {
        console.log('Failed to get storage location of u_sampler4');
        return;
    }

    u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
    if (!u_Sampler5) {
        console.log('Failed to get storage location of u_sampler5');
        return;
    }

    u_Sampler6 = gl.getUniformLocation(gl.program, 'u_Sampler6');
    if (!u_Sampler6) {
        console.log('Failed to get storage location of u_sampler6');
        return;
    }

    u_Sampler7 = gl.getUniformLocation(gl.program, 'u_Sampler7');
    if (!u_Sampler7) {
        console.log('Failed to get storage location of u_sampler7');
        return;
    }

    u_Sampler8 = gl.getUniformLocation(gl.program, 'u_Sampler8');
    if (!u_Sampler8) {
        console.log('Failed to get storage location of u_sampler8');
        return;
    }

    u_Sampler9 = gl.getUniformLocation(gl.program, 'u_Sampler9');
    if (!u_Sampler9) {
        console.log('Failed to get storage location of u_sampler9');
        return;
    }

    textureID = gl.getUniformLocation(gl.program, 'textureID');
    if (!textureID) {
        console.log('failed to get storage location of textureID');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('failed to get storage location of u_ProjectionMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('failed to get storage location of u_ViewMatrix');
        return;
    }    

    
}


let glob;
function main() {
    setupWebGL();
    connectVariablesToGLSL();

    //adding a mousemove event listener causes the cube to only start rendering after like 20 seconds
    //doing it this method causes no delay
    xSlider = document.getElementById("xSlider");
    ySlider = document.getElementById("ySlider");
    zSlider = document.getElementById("zSlider");

    fpsCounter = document.getElementById("fps");

    initTextures(0);

    gl.clearColor(0, 0, 0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    glob = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, glob.elements);
}

function convertCoordinatesToGL(ev) {
    var x = ev.clientX; 
    var y = ev.clientY; 
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return ([x, y]);
}

let lastCalledTime;
const GRASS_BLOCK = [2, 2, 2, 2, 1, 0];
const STONE_BLOCK = [3, 3, 3, 3, 3, 3];
const SKYBOX = [4, 7, 6, 8, 9, 5];
function renderAllShapes(useSliderValues = true) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let projectionMatrix = new Matrix4();
    projectionMatrix.setPerspective(90, canvas.width / canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projectionMatrix.elements);

    let viewMatrix = new Matrix4();
    viewMatrix.setLookAt(0, 0, -3,      0, 0, 0,    0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    

    if (useSliderValues) {
        glob.setRotate(-xSlider.value, 1, 0, 0);
        glob.rotate(ySlider.value, 0, 1, 0);
        glob.rotate(zSlider.value, 0, 0, 1);
        
    }

    gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, glob.elements);

    let ground = new Cube();
    ground.matrix = new Matrix4();
    ground.matrix.setTranslate(0, -0.5, 0);
    ground.matrix.scale(10, 1, 10);
    ground.textureArray = STONE_BLOCK;
    ground.useColor = false;
    ground.render();

    let c = new Cube();
    c.textureArray = GRASS_BLOCK;
    c.render();

    let coloredCube = new Cube();
    coloredCube.useColor = true;
    coloredCube.color = [0, 0, 1, 1];
    coloredCube.matrix.setTranslate(-0.75, 0, 0);
    coloredCube.useColor = true;
    coloredCube.render();

    let skybox = new Cube();
    skybox.textureArray = SKYBOX;
    skybox.matrix.scale(50, 50, 50);
    skybox.render()

    
}

function resetSlider(name) {
    let angle = 0;
    switch (name) {
        case "xSlider":
            xSlider.value = 21;
            angle = 21;
            break;
        case "ySlider":
            ySlider.value = 125;
            angle = 125;
            break;
        default:
            document.getElementById(name).value = 0;
            break;
    }

    renderAllShapes();
    //rotateBodyPart(name, angle);
}


let lastTimeStamp = 0;
let totalTime = 0;

function countFPS() {
    //fps counter code from https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html
    if (!lastCalledTime) {
        lastCalledTime = Date.now();
        fps = 0;
    } else {
        delta = (Date.now() - lastCalledTime)/1000;
        lastCalledTime = Date.now();
        fps = 1/delta;
    }

    fpsCounter.innerText = "FPS: " + fps.toFixed(3);

    requestAnimationFrame(countFPS);
}


//skybox texture from https://opengameart.org/content/sky-box-sunny-day
const texturePath = 'textures/';
const textures = [
    'dirt.png',
    'grass_block_top.png',
    'grass_block_side.png',
    'stone.png',
    'skybox1.png',
    'skybox2.png',
    'skybox3.png',
    'skybox4.png',
    'skybox5.png',
    'skybox6.png',
]
function initTextures(n) {
    let numLoadedTextures = 0;

    for (let i = 0; i < textures.length; i++) {
        let img = new Image();

        img.onload = function() {
            loadTexture(n, img, i);
            numLoadedTextures++;

            if (numLoadedTextures == textures.length)
                renderAllShapes();
        }
    
        img.src = texturePath + textures[i];
    }
    
    return true;
}

function loadTexture(n, img, samplerID) {
    let texture = gl.createTexture();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0 + samplerID);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.uniform1i(sampler(samplerID), samplerID);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

function sampler(i) {
    switch (i) {
        case 0:
            return u_Sampler0;
        case 1:
            return u_Sampler1;
        case 2:
            return u_Sampler2;
        case 3:
            return u_Sampler3;
        case 4:
            return u_Sampler4;
        case 5:
            return u_Sampler5;
        case 6:
            return u_Sampler6;
        case 7:
            return u_Sampler7;
        case 8:
            return u_Sampler8;
        case 9:
            return u_Sampler9;        
    }
}