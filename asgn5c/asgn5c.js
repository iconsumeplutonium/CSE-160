import * as three from 'three';
import * as PlayerController from './PlayerController.js';
import * as CubeSphere from './CubeSphere.js';
import * as UIManager from './UIManager.js';
import * as LookupTable from './LookupTable.js';
import * as Noise from './Noise.js';
import {Chunk} from './Chunk-old.js';
import * as InfiniteTerrain from './InfiniteTerrain.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import datGui from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/+esm'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { createNoise3D } from './simplex-noise.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

export { three };

let renderer, scene, camera, directionalLight, canvas;
let cubeGeometry, icosahedronGeo, sphereGeo;
let material, loader;
let cubes = [];
let interceptor;

let flashlight;

let controls;

function main() {

	canvas = document.getElementById('webgl');
	renderer = new three.WebGLRenderer( { antialias: true, canvas } );

	camera = new three.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 1000);
    camera.rotation.x = -Math.PI / 2;
    camera.rotation.y = -Math.PI / 2;
    camera.rotation.z = -Math.PI / 2;

    camera.position.x = -70;
    camera.position.y = 30;
	camera.position.z = 0;
	scene = new three.Scene();

    let dirLight = new three.DirectionalLight(0xFFFFFF, 1.5);
    dirLight.position.set(10, 99, 10);
    scene.add(dirLight);


    // let light = new three.AmbientLight(0xFFFFFF, 1);
    // scene.add(light);

    controls = new PointerLockControls(camera, document.body);
    canvas.addEventListener('click', function() {
        controls.lock();
    });

    controls.connect();
    

    scene.add(controls.getObject())
    PlayerController.setupController();

    UIManager.connectUIElements();

	renderer.render(scene, camera);
    const loader = new three.CubeTextureLoader();
    loader.setPath('./textures/')
    textureCube = loader.load([
        'skybox4.png',
        'skybox5.png',
        'skybox6.png',
        'skybox2.png',
        'skybox1.png',
        'skybox3.png',
    ]); 
    scene.background = textureCube;

    const size = 1000;
    water = createSquare(new three.Vector3(0, 0, 0), size, size);
    scene.add(water);

    let lightSize = 5;
    let box = new three.BoxGeometry(lightSize, lightSize, lightSize);
    let mat = new three.MeshBasicMaterial({color: 0xFFFF00});
    light = new three.Mesh(box, mat);
    scene.add(light);

    let FogShader = {
        uniforms: {
            "tDiffuse": { type: "t", value: null },
            "fogNear": { type: "f", value: 0 },
            "fogFar": { type: "f", value: 10 },
            "fogColor": { type: "c", value: new three.Color(0xffffff) },
            "u_CameraPos":   { value: camera.position.clone() },
        },
    
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
    
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float fogNear;
            uniform float fogFar;
            uniform vec3 fogColor;
            uniform vec4 u_CameraPos;

            varying vec2 vUv;
            varying float fogDepth;
            void main() {
                float depth = gl_FragCoord.z / gl_FragCoord.w;
                float fogFactor = smoothstep( fogNear, fogFar, depth );
                vec4 fogColor = vec4( fogColor, 1.0 );
                vec4 color = texture2D(tDiffuse, vUv);

                vec4 underwaterColor = vec4(0.04, 0.368, 1.0, 1.0);
            

                gl_FragColor = color;//(u_CameraPos.y <= 3.0) ? mix(color, underwaterColor, 0.5) : color;
            }`
    };

    renderer.autoClear = false;
    composer = new EffectComposer(renderer);
    var renderPass = new RenderPass(scene, camera);
    renderer.clearDepth = false;
    composer.addPass(renderPass);

    // Create the fog pass
    fogPass = new ShaderPass(FogShader);
    fogPass.renderToScreen = true;

    
    // Add it to your EffectComposer
    
    composer.addPass(fogPass);

    
    requestAnimationFrame(Update);
}



let normalMap;
let raycaster;
let water;
let light;
let textureCube;
let composer;
let fogPass;
function Update(time) {

    PlayerController.movePlayer(controls);
    //InfiniteTerrain.updateVisibleChunks(new three.Vector2(camera.position.x, camera.position.z), scene);

    

    UIManager.displayFPS();
    let x = (canvas.width / 2 / canvas.width) * 2 - 1;
    let y = - (canvas.height / 2 / canvas.height) * 2 + 1;

    water.material.uniforms.u_Time.value = time;
    water.material.uniforms.u_CameraPos.value = camera.position.clone()

    let lightPos = new three.Vector3(slider1. value, slider2.value, slider3.value);
    light.position.x = lightPos.x;
    light.position.y = lightPos.y;
    light.position.z = lightPos.z;
    water.material.uniforms.u_LightPos.value = lightPos.normalize();

    water.material.uniforms.useEnvReflct.value = UIManager.envReflectCheckbox.checked;
    water.material.uniforms.useScattering.value = UIManager.scatteringCheckbox.checked;

    water.material.uniforms.u_FragColor.value = UIManager.getLightColor();
   
    fogPass.material.uniforms.u_CameraPos.value = camera.position.clone()
    //renderer.render(scene, camera);
    composer.render()
    requestAnimationFrame(Update);
    
}



function createSquare(position, size, resolution) {
    const geometry = new three.BufferGeometry();

    let newCorner = new three.Vector3(-size / 2, 50, -size / 2);

    // let size = 100;
    // let resolution = 10;
    let vertices = [];

    const stepSize = size / resolution;
    let k = newCorner.y;
    for (let i = newCorner.x; i < newCorner.x + size; i += stepSize) {
        for (let j = newCorner.z; j < newCorner.z + size; j += stepSize) {

            vertices.push(i, k, j);
            vertices.push(i, k, j + stepSize);
            vertices.push(i + stepSize, k, j);
            
            vertices.push(i + stepSize, k, j);
            vertices.push(i, k, j + stepSize);
            vertices.push(i + stepSize, k, j + stepSize);
            
        }
    }

    geometry.setAttribute('position', new three.BufferAttribute(new Float32Array(vertices), 3));

    const material = new three.ShaderMaterial({
        uniforms: {
            u_LightPos:    { value: new three.Vector3(100, 100, 0).normalize() }, 
            u_FragColor:   { value: new three.Color(0.286, 0.513, 0.749) },
            u_Time:        { type: "f", value: 0 },
            u_CameraPos:   { value: camera.position.clone() },
            u_Skybox:      { value: textureCube},
            useEnvReflct:  { value: UIManager.envReflectCheckbox.checked},
            useScattering: { value: UIManager.scatteringCheckbox.checked}
        },
        vertexShader: `
            varying vec3 v_Position;
            varying vec3 v_Normal;

            uniform float u_Time;

            struct Wave {
                float amplitude;
                float wavelength;
                float speed;

                float frequency;
                
                vec2 dir;
            };

            float waveCoord(vec3 p, Wave w) {
                //float x = dot(w.dir, p.xz)
                return p.x * w.dir.x + p.z * w.dir.y;
            }

            float waveHeight(vec3 p, Wave w) {
                float xz = waveCoord(p, w);
                float phase = w.speed * w.frequency;

                //float x = w.amplitude * sin(dot(p.xz, w.dir) * w.frequency + u_Time * phase);
                float x = w.amplitude * exp(sin(dot(p.xz, w.dir) * w.frequency + u_Time * phase) - 1.0);
                return x;
            }

            vec3 waveNormal(vec3 p, Wave w) {
                // float dx = w.frequency * w.amplitude * w.dir.x * cos(xz * w.frequency + u_Time * phase);
                // float dz = w.frequency * w.amplitude * w.dir.y * cos(xz * w.frequency + u_Time * phase);
                                
                float phase = w.speed * w.frequency;
                float x = dot(p.xz, w.dir) * w.frequency + u_Time * phase;

                float dx = w.frequency * w.amplitude * w.dir.x * exp(sin(x) - 1.0) * cos(x);
                float dz = w.frequency * w.amplitude * w.dir.y * exp(sin(x) - 1.0) * cos(x);
                
                float dy = -sqrt(1.0 - dx * dx - dz * dz);
                return vec3(dx, 0.01, dz);
            }

            float rand(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            void main() {
                Wave w;
                w.amplitude = 5.0;
                float wavelength = 64.0;
                w.frequency = 2.0 / wavelength;
                w.speed = 0.05;
                w.dir = vec2(1.0);

                int numWaves = 28;
                float height = 0.0;
                vec3 normal = vec3(0.0);
                float iter = 0.0;

                float persistence = 0.82;
                float lacunarity = 1.18;
                float timeMult = 0.7;
                float amplitudeThreshold = 0.1;

                //to ensure the tinier sine waves dont affect the normal lighting (otherwise, you get a noticable grid of lines going back and forth across the water surface)
                float normalContribution = 1.0;
                float contributionFalloff = 0.91;

                vec3 pos = position;

                for (int i = 0; i < numWaves; i++) {
                    iter += 1232.399963;
                    w.dir = vec2(sin(iter), cos(iter));
                    float phase = w.speed * w.frequency;

                    float x = dot(pos.xz, w.dir) * w.frequency + u_Time * phase;
                    float wave = w.amplitude * exp(sin(x) - 1.0);
                    float dx = w.amplitude * wave * cos(x);


                    height += wave;
                    pos.xz += w.dir * -dx * w.amplitude * 0.125;
                
                    normal += waveNormal(pos, w) * normalContribution;
                    normalContribution *= contributionFalloff;


                    w.amplitude *= persistence;
                    w.frequency *= lacunarity;
                    w.speed *= timeMult;
                }

                v_Position = vec3(position.x, height, position.z);
                v_Normal = normal;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(v_Position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 u_LightPos;
            uniform vec3 u_FragColor;
            uniform vec3 u_CameraPos;

            varying vec3 v_Position;
            varying vec3 v_Normal;

            uniform samplerCube u_Skybox;

            uniform bool useEnvReflct;
            uniform bool useScattering;

            vec3 fogColor = vec3(0.5, 0.5, 0.5);
            float fogRadius = 400.0;

            void main() {
                vec3 L = normalize(u_LightPos);
                vec3 N = normalize(v_Normal);
                vec3 R = normalize(2.0 * dot(L, N) * N - L);
                vec3 V = normalize(u_CameraPos - v_Position);

                float fresnel = pow(1.0 - dot(N, V), 5.0) + 0.2;

                vec3 k_d = vec3(0.5);
                vec3 diffuse =  max(dot(L, N), 0.0) * u_FragColor;
                vec3 specular = vec3(1.0) * pow(max(dot(R, V), 0.0), 5.0) * fresnel;
                vec3 ambient = vec3(0.5) * u_FragColor;

                vec3 R2 = normalize(2.0 * dot(N, V) * N - V);
                vec3 reflectedSkyboxCol = textureCube(u_Skybox, R2).xyz;

                vec3 environRflct         =  (useEnvReflct)  ?  reflectedSkyboxCol * fresnel * 0.1                               :  vec3(0.0);
                vec3 subsurfaceScattering =  (useScattering) ?  vec3(0.0293, 0.0698, 0.1717) * 0.1 * (0.2 + v_Position.y / 2.0)  :  vec3(0.0);  //scattering formula from here: https://www.shadertoy.com/view/MdXyzX

                vec3 pixelColor = diffuse + ambient + specular + environRflct + subsurfaceScattering;
                float dist = clamp(length(u_CameraPos - v_Position) / fogRadius, 0.0, 1.0);

                //mix(pixelColor, fogColor, dist)
                gl_FragColor = vec4(pixelColor, 1.0);
            }
        `,
        side: three.DoubleSide
    });
    


    const mesh = new three.Mesh(geometry, material);

    return mesh;
}


main();