var VSHADER_SOURCE = `
    uniform mat4 u_GlobalRotationMatrix;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ProjectionMatrix;
    uniform mat4 u_ViewMatrix;

    uniform mat4 u_NormalMatrix;
    attribute vec4 a_Normal;
    varying vec3 v_Normal;

    attribute vec4 a_Position;
    varying vec3 v_Position;

    attribute vec2 a_UV;
    varying vec2 v_UV;

    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        v_Position = vec3(u_ModelMatrix * a_Position);
        v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
    }`;

var FSHADER_SOURCE = `
    precision highp float;
    varying vec2 v_UV;
    varying vec3 v_Normal;

    uniform vec4 u_FragColor;
    uniform vec3 u_LightColor;

    uniform sampler2D u_Sampler0;

    uniform vec3 u_LightPos;
    varying vec3 v_Position;

    uniform vec3 u_CameraPos;
    uniform float u_SpecularExponent;
    uniform int u_RenderingMode;

    void main() {
        vec3 L = normalize(u_LightPos - v_Position);
        vec3 N = normalize(v_Normal);
        vec3 R = normalize(2.0 * dot(L, N) * N - L);
        vec3 V = normalize(u_CameraPos);

        vec3 k_d = vec3(0.5, 0.5, 0.5);
        vec3 k_a = vec3(0.25, 0.25, 0.25);
        vec3 k_s = vec3(0.5, 0.5, 0.5);

        if (u_RenderingMode == 0) {
            gl_FragColor = vec4(N, 1.0);
        } else if (u_RenderingMode == 1) {
            gl_FragColor = u_FragColor;
        } else {

            vec3 diffuse = k_d * max(dot(L, N), 0.0) * vec3(u_FragColor);
            vec3 ambient = k_a * u_LightColor;
            vec3 specular = k_s * pow(max(dot(R, V), 0.0), u_SpecularExponent) * u_LightColor;            

            gl_FragColor = texture2D(u_Sampler0, v_UV);
            gl_FragColor = vec4(diffuse + ambient + specular, 1.0);
            
            float r = length(u_LightPos - v_Position);
            if (r < 1.0)
                gl_FragColor = vec4(u_LightColor, 1.0);
        
        }
    }`;


let canvas, gl;
let a_Position, a_Color, a_UV, textureID, u_FragColor, a_Normal;
let u_GlobalRotationMatrix, u_ModelMatrix, u_ProjectionMatrix, u_ViewMatrix, u_NormalMatrix;
let u_LightPos, u_CameraPos, u_LightColor, u_SpecularExponent, u_RenderingMode;
let u_Sampler0;
let u_Samplers = [];
let instancingExtension;
let globalRotx, globalRoty, globalRotz;

let mouseDelta = new Vector3();
let camera;
const chunkSize = 12;
let skybox = []

function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
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

    // a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    // if (!a_Color) {
    //     console.log('Failed to get the storage location of v_Color');
    //     return;
    // }

    // u_GlobalRotationMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotationMatrix');
    // if (!u_GlobalRotationMatrix) {
    //     console.log('Failed to get the storage location of u_GlobalRotationMatrix');
    //     return;
    // }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;            
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (!a_UV) {
        console.log('Failed to get storage location of a_UV');
        return;
    }

    for (let i = 0; i <= 0; i++) {
        let sampler = gl.getUniformLocation(gl.program, `u_Sampler${i}`);
        if (!sampler) {
            console.log(`Failed to get storage location of u_Sampler${i}`);
            return;
        }
        u_Samplers.push(sampler);
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

    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix) {
        console.log('failed to get storage location of u_NormalMatrix');
        return;
    }   
    
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    // if (!a_Normal) {
    //     console.log('Failed to get storage location of a_Normal');
    //     return;
    // }

    u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
    if (!u_LightPos) {
        console.log('failed to get storage location of u_LightPos');
        return;
    }

    u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');
    if (!u_CameraPos) {
        console.log('failed to get storage location of u_CameraPos');
        return;
    }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('failed to get storage location of u_FragColor');
        return;
    }

    u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    if (!u_LightColor) {
        console.log('failed to get storage location of u_LightColor');
        return;
    }

    u_SpecularExponent = gl.getUniformLocation(gl.program, 'u_SpecularExponent');
    if (!u_SpecularExponent) {
        console.log('failed to get storage location of u_SpecularExponent');
        return;
    }

    u_RenderingMode = gl.getUniformLocation(gl.program, 'u_RenderingMode');
    if (!u_SpecularExponent) {
        console.log('failed to get storage location of u_RenderingMode');
        return;
    }
}


let glob;
function main(firstStart = true) {
    setupWebGL();
    connectVariablesToGLSL();

    camera = new Camera(90);

    initTextures(0);

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    connectAllUIElements();

    if (firstStart) {

        document.addEventListener('keydown', function(ev) {
                if (ev.keyCode == 87) keys.w      = true;
            else if (ev.keyCode == 83) keys.s      = true;
            else if (ev.keyCode == 65) keys.a      = true;
            else if (ev.keyCode == 68) keys.d      = true;
            else if (ev.keyCode == 32) keys.space  = true;
            else if (ev.keyCode == 16) keys.lshift = true;
        });

        document.addEventListener('keyup', function(ev) {
                if (ev.keyCode == 87) keys.w      = false;
            else if (ev.keyCode == 83) keys.s      = false;
            else if (ev.keyCode == 65) keys.a      = false;
            else if (ev.keyCode == 68) keys.d      = false;
            else if (ev.keyCode == 32) keys.space  = false;
            else if (ev.keyCode == 16) keys.lshift = false;
        });

        document.addEventListener('mousemove', function(ev) {
            let x = ev.movementX;
            let y = ev.movementY;

            mouseDelta = new Vector3([x, y, 1]).normalize();

        })

        canvas.addEventListener('mousedown', function(event) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
            canvas.requestPointerLock();
        });

    }


    for (let i = 0; i <= 5; i++)
        skybox[i] = new Cube("skybox", [1, 1, 1, 1], 0);

    if (firstStart)
        playerController();

    gl.uniform1i(u_RenderingMode, 5);
}

let c = new Cube(undefined, [1, 0, 0, 1], 20);
c.matrix.setTranslate(0, 0, -2);
c.matrix.rotate(45, 1, 1, 1)
c.texture = GetUVsForTexture("grass_block");

let sphere = new Sphere(new Matrix4().setTranslate(0, 0, 2), [0, 1, 1, 1], 20.0);

let lightCube = new Cube(undefined, [1, 1, 0, 1]);
lightCube.matrix.setTranslate(-7, 5, 0);

function renderAllShapes() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //only if mouseDelta is declared and the canvas is selected
    if (mouseDelta && document.pointerLockElement === canvas) {
        //const EPSILON = 0.001;

        //Left and right
        let m = new Matrix4();
        m.setRotate(mouseDelta.x * -sensitivity * deltaTime, camera.up.x, camera.up.y, camera.up.z);
        let f = m.multiplyVector3(camera.forward).normalize();

        //Up and down
        m.setRotate(mouseDelta.y * -sensitivity * deltaTime, camera.right.x, camera.right.y, camera.right.z);
        let g = m.multiplyVector3(camera.forward).normalize();

        camera.at = camera.eye.add(f).add(g);
        camera.applyViewMatrix();

        mouseDelta.x = 0;
        mouseDelta.y = 0;
    } 
   
    gl.uniform3fv(u_LightPos, new Float32Array([lightSliders[0].value, lightSliders[1].value, lightSliders[2].value]));  // ));
    gl.uniform3fv(u_CameraPos, camera.eye.elements);

    let lightCol = getLightColor();
    gl.uniform3fv(u_LightColor, new Float32Array(lightCol.elements));
    lightCube.color = [lightCol.x, lightCol.y, lightCol.z, 1];

    lightCube.matrix.setTranslate(lightSliders[0].value, lightSliders[1].value, lightSliders[2].value);

    displaySkybox();
    c.renderFast();
    sphere.render();
    lightCube.renderFast();

    
    //updateVisibleChunks();
}

//because I enabled backface culling, placing a super large cube around the player wont work because the inside
//gets culled, and so nothing appears
//to fix this, i just placed 6 planes around the player
function displaySkybox() {
    //top
    skybox[0].matrix.setTranslate(camera.eye.x, camera.eye.y + 50, 0 + camera.eye.z);
    skybox[0].matrix.scale(100, 0.1, 100);
    skybox[0].matrix.rotate(180, 1, 0, 0);

    //bottom
    skybox[1].matrix.setTranslate(camera.eye.x, camera.eye.y - 50, camera.eye.z);
    skybox[1].matrix.scale(100, 0.1, 100);
    skybox[1].matrix.rotate(180, 1, 0, 0);

    skybox[2].matrix.setTranslate(camera.eye.x + 50, camera.eye.y, camera.eye.z);
    skybox[2].matrix.scale(0.1, 100, 100);
    skybox[2].matrix.rotate(180, 0, 1, 0);

    skybox[3].matrix.setTranslate(camera.eye.x - 50, camera.eye.y, camera.eye.z);
    skybox[3].matrix.scale(0.1, 100, 100);
    skybox[3].matrix.rotate(180, 0, 1, 0);

    skybox[4].matrix.setTranslate(camera.eye.x, camera.eye.y, camera.eye.z + 50);
    skybox[4].matrix.scale(100, 100, 0.1);

    skybox[5].matrix.setTranslate(camera.eye.x, camera.eye.y, camera.eye.z - 50);
    skybox[5].matrix.scale(100, 100, 0.1);

    for (let i = 0; i <= 5; i++) {
        skybox[i].renderFast();
    }
}