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


    //uniform sampler2DArray skybox;
    // else if (textureID >= 4 && textureID <= 9) {
    //     gl_FragColor = texture2D(skybox, vec3(v_UV, textureID));
    // }


    //uniform float texID;
    void main() {
        //int textureID = int(texID);
        gl_FragColor = u_FragColor;

        gl_FragColor = texture2D(u_Sampler0, v_UV);
        

        

        // if (textureID == -2) {
        //     gl_FragColor = u_FragColor;
        // } else if (textureID == -1) {
        //     gl_FragColor = vec4(v_UV, 1.0, 1.0);
        // } else if (textureID == 0) {
        //     gl_FragColor = texture2D(u_Sampler0, v_UV);
        // } else if (textureID == 1) {
        //     gl_FragColor = texture2D(u_Sampler1, v_UV);
        // } else if (textureID == 2) {
        //     gl_FragColor = texture2D(u_Sampler2, v_UV);
        // } else if (textureID == 3) {
        //     gl_FragColor = texture2D(u_Sampler3, v_UV);
        // } 
        // else if (textureID == 4) {
        //     gl_FragColor = texture2D(u_Sampler4, v_UV);
        // } else if (textureID == 5) {
        //     gl_FragColor = texture2D(u_Sampler5, v_UV);
        // } else if (textureID == 6) {
        //     gl_FragColor = texture2D(u_Sampler6, v_UV);
        // } else if (textureID == 7) {
        //     gl_FragColor = texture2D(u_Sampler7, v_UV);
        // } else if (textureID == 8) {
        //     gl_FragColor = texture2D(u_Sampler8, v_UV);
        // } else if (textureID == 9) {
        //     gl_FragColor = texture2D(u_Sampler9, v_UV);
        // }
        // else {
        //     gl_FragColor = vec4(1, 0, 1, 1);
        // }
        
    }`;


let canvas, gl;
let a_Position, a_Color, a_UV, textureID, u_FragColor;
let u_GlobalRotationMatrix, u_ModelMatrix, u_ProjectionMatrix, u_ViewMatrix;
let u_Sampler0, u_Sampler1, u_Sampler2, u_Sampler3;
let u_Samplers = [];
let instancingExtension;
let globalRotx, globalRoty, globalRotz;
//let xSlider, ySlider, zSlider;
let debugX, debugY, debugZ;
let fpsCounter;
let mouseDelta = new Vector3();
let camera;

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

    // u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    // if (!u_FragColor) {
    //     console.log('Failed to get the storage location of u_FragColor');
    //     return;
    // }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (!a_UV) {
        console.log('Failed to get storage location of a_UV');
        return;
    }

    // skyboxArray = gl.getUniformLocation(gl.program, 'skybox');
    // if (!skyboxArray) {
    //     console.log('Failed to get storage location of skybox');
    //     return;
    // }

    for (let i = 0; i <= 0; i++) {
        let sampler = gl.getUniformLocation(gl.program, `u_Sampler${i}`);
        if (!sampler) {
            console.log(`Failed to get storage location of u_Sampler${i}`);
            return;
        }
        u_Samplers.push(sampler);
    }

    // textureID = gl.getUniformLocation(gl.program, 'texID');
    // if (!textureID) {
    //     console.log('failed to get storage location of textureID');
    //     return;
    // }

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

    instancingExtension = gl.getExtension("ANGLE_instanced_arrays");
    if (!instancingExtension) {
        console.log('failed to get ANGLED_instanced_arrays extension');
        return;
    }

    
}


let glob;
function main() {
    setupWebGL();
    connectVariablesToGLSL();

    camera = new Camera(90);

    // xSlider = document.getElementById("xSlider");
    // ySlider = document.getElementById("ySlider");
    // zSlider = document.getElementById("zSlider");
    selectedSlotDisplayText = document.getElementById("selectedBlock");
    selectedSlotDisplayText.innerText = `Selected Block: ${inventory[selectedSlot]}`;

    fpsCounter = document.getElementById("fps");

    initTextures(0);

    gl.clearColor(0, 0, 0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    glob = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, glob.elements);

    document.addEventListener('keydown', function(ev) {
             if (ev.keyCode == 87) keys.w = true;
        else if (ev.keyCode == 83) keys.s = true;
        else if (ev.keyCode == 65) keys.a = true;
        else if (ev.keyCode == 68) keys.d = true;
        else if (ev.keyCode == 32) keys.space = true;
        else if (ev.keyCode == 16) keys.lshift = true;
    });

    document.addEventListener('keyup', function(ev) {
             if (ev.keyCode == 87) keys.w = false;
        else if (ev.keyCode == 83) keys.s = false;
        else if (ev.keyCode == 65) keys.a = false;
        else if (ev.keyCode == 68) keys.d = false;
        else if (ev.keyCode == 32) keys.space = false;
        else if (ev.keyCode == 16) keys.lshift = false;
    });

    document.addEventListener('mousemove', function(ev) {
        //let [x, y] = convertCoordinatesToGL(ev);
        let x = ev.movementX;
        let y = ev.movementY;
        //console.log(`X: ${x}, Y: ${y}`);
        //if (!mouseDelta) {
            mouseDelta = new Vector3([x, y, 1]).normalize();
        // } else {
        //     mouseDelta.x = x;
        //     mouseDelta.y = y;
        //     mouseDelta = mouseDelta.normalize();
        //     console.log(mouseDelta);
        // }

        if (document.pointerLockElement === canvas)
            renderAllShapes();

        mouseDelta.x = 0;
        mouseDelta.y = 0;
    })

    canvas.addEventListener('click', function(event) {
        canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
        canvas.requestPointerLock();

        if (event.which === 1 && document.pointerLockElement === canvas) {
            let chunkCoord = new Vector3([Math.floor(camera.at.x / 16), Math.floor(camera.at.z / 16), 0]);
            //console.log(`Real pos: (${camera.at.x}, ${camera.at.y}, ${camera.at.z}), Chunk: ${chunkCoord.toString()}`);

            //get the chunk itself
            //if camera.at is not in a valid chunk, return
            let chunk;
            try {
                chunk = chunks.get(chunkCoord.toString());
            } catch (e) {
                return;
            }
            
            //convert world space coordinate to chunk space coordinate
            let chunkSpaceCoordX = Math.round(camera.at.x - (chunk.offset.x * chunk.chunkWidth));
            let chunkSpaceCoordY = Math.round(camera.at.y);
            let chunkSpaceCoordZ = Math.round(camera.at.z - (chunk.offset.y * chunk.chunkHeight));

            //console.log(chunkSpaceCoordX, chunkSpaceCoordY, chunkSpaceCoordZ);
            chunk.deleteBlock(chunkSpaceCoordX, chunkSpaceCoordY, chunkSpaceCoordZ);
            chunks.set(chunk.offset.toString(), chunk);
        }        
    });

    canvas.addEventListener('mousedown', function(event) {
        if (document.pointerLockElement === canvas && event.which === 3) {
            //calculate the chunk coordinate of camera.at
            let chunkCoord = new Vector3([Math.floor(camera.at.x / 16), Math.floor(camera.at.z / 16), 0]);
            //console.log(`Real pos: (${camera.at.x}, ${camera.at.y}, ${camera.at.z}), Chunk: ${chunkCoord.toString()}`);

            //get the chunk itself
            //if camera.at is not in a valid chunk, return
            let chunk;
            try {
                chunk = chunks.get(chunkCoord.toString());
            } catch (e) {
                return;
            }
            
            //convert world space coordinate to chunk space coordinate
            let chunkSpaceCoordX = Math.round(camera.at.x - (chunk.offset.x * chunk.chunkWidth));
            let chunkSpaceCoordY = Math.round(camera.at.y);
            let chunkSpaceCoordZ = Math.round(camera.at.z - (chunk.offset.y * chunk.chunkHeight));

            //console.log(chunkSpaceCoordX, chunkSpaceCoordY, chunkSpaceCoordZ);
            chunk.addOrModifyBlock(chunkSpaceCoordX, chunkSpaceCoordY, chunkSpaceCoordZ, inventory[selectedSlot]);
            chunks.set(chunk.offset.toString(), chunk);
        }
    })

    canvas.addEventListener('wheel', function(event) {
        if (event.deltaY < 0)
            selectPrev();
        else
            selectNext();
    })

    // gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.BACK);


    chunk = new Chunk(16, 16, new Vector3([0, 0, 0]));
    chunk2 = new Chunk(16, 16, new Vector3([1, 0, 0]));
    chunk3 = new Chunk(16, 16, new Vector3([0, 1, 0]));
    chunk4 = new Chunk(16, 16, new Vector3([1, 1, 0]));

    chunks.set(chunk.offset.toString(), chunk);
    chunks.set(chunk2.offset.toString(), chunk2);
    chunks.set(chunk3.offset.toString(), chunk3);
    chunks.set(chunk4.offset.toString(), chunk4);

    skybox = new Cube("skybox");
    crosshairCube = new Cube("stone_block")

    debugX = document.getElementById("debugX");
    debugY = document.getElementById("debugY");
    debugZ = document.getElementById("debugZ");

    playerController();
}

let chunk, chunk2, chunk3, chunk4, skybox;
let chunks = new Map();

let blocks = []
let map= [];

const sensitivity = 6;

let globalVertexArray = [];
let globalUVArray = [];

let crosshairCube;

function renderAllShapes(useSliderValues = true) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //only if mouseDelta is declared and the canvas is selected
    if (mouseDelta && document.pointerLockElement === canvas) {
        //const EPSILON = 0.001;

        //Left and right
        let m = new Matrix4();
        m.setRotate(mouseDelta.x * -sensitivity, camera.up.x, camera.up.y, camera.up.z);
        let f = m.multiplyVector3(camera.forward).normalize();

        //Up and down
        m.setRotate(mouseDelta.y * -sensitivity, camera.right.x, camera.right.y, camera.right.z);
        let g = m.multiplyVector3(camera.forward).normalize();

        //no matter what i do, clamping the fucking g vector clamps the f vector as well
        //i fucking hate this language

        // if (g.x < EPSILON)
        //     g.x = EPSILON;

        // if (g.x > 180 - EPSILON)
        //     g.x = 180 - EPSILON;

        // if (g.y < -0.9)
        //     g.y = -0.9;

        // if (g.z > 180 - EPSILON)
        //     g.z = 180 - EPSILON;

        //console.log(f.toString(), g.toString());

        camera.at = camera.eye.add(f).add(g);
        camera.applyViewMatrix();
    } 

    // if (useSliderValues) {
    //     glob.setRotate(-xSlider.value, 1, 0, 0);
    //     glob.rotate(ySlider.value, 0, 1, 0);
    //     glob.rotate(zSlider.value, 0, 0, 1);
    // }

    gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, glob.elements);

    // let ground = new Cube("stone_block");
    // ground.matrix = new Matrix4();
    // ground.matrix.setTranslate(0, -0.5, 0);
    // ground.matrix.scale(10, 1, 10);
    // // ground.useColor = false;
    // ground.renderFast();

    // let c = new Cube("grass_block");
    // c.renderFast();

    // let coloredCube = new Cube();
    // coloredCube.useColor = true;
    // coloredCube.color = [0, 0, 1, 1];
    // coloredCube.matrix.setTranslate(-0.75, 0, 0);
    // coloredCube.useColor = true;
    // coloredCube.render();

    
    skybox.matrix.setTranslate(camera.eye.x, camera.eye.y, camera.eye.z);
    skybox.matrix.scale(100, 100, 100);
    skybox.renderFast();

    crosshairCube.matrix.setTranslate(camera.at.x, camera.at.y, camera.at.z);
    crosshairCube.matrix.scale(0.1, 0.1, 0.1);
    crosshairCube.texture = GetUVsForTexture(inventory[selectedSlot]);
    crosshairCube.renderFast();

    // for (let x = 0; x < 16; x++) {
    //     for (let y = 0; y < 16; y++) {

    //         let z = map[x][y].toFixed(1) * 10;
    //         for (let i = 0; i < z - 1; i++) {
    //             let block = new Cube("stone_block");
    //             block.matrix.setTranslate(x, i, y);
    //             block.renderFast();
    //         }

    //         let block = new Cube("grass_block");
    //         block.matrix.setTranslate(x, z - 1, y);
    //         block.renderFast();

    //     }
    // }
    
    // chunk.displayChunk();

    
    // chunk2.displayChunk();

    
    // chunk3.displayChunk();

    
    // chunk4.displayChunk();
    chunks.forEach(chunk => {
        chunk.displayChunk();
    })


    // for (let i = 0; i < blocks.length; i++) {
    //     blocks[i].renderFast();
    // }

    


    
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
}