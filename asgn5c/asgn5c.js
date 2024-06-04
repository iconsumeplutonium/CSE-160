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

	camera = new three.PerspectiveCamera(90, canvas.width / canvas.height, 0.1, 1000);
    camera.rotation.x = -Math.PI / 2;
    camera.rotation.y = -1;
    camera.rotation.z = -Math.PI / 2;

    camera.position.x = 0;
    camera.position.y = 50;
	camera.position.z = 0;

	scene = new three.Scene();

    let dirLight = new three.DirectionalLight(0xFFFFFF, 1.5);
    dirLight.position.set(10, 99, 10);
    scene.add(dirLight);


    let light = new three.AmbientLight(0xFFFFFF, 1);
    scene.add(light);

    controls = new PointerLockControls(camera, document.body);
    canvas.addEventListener('click', function() {
        controls.lock();
    });

    controls.connect();
    

    scene.add(controls.getObject())
    PlayerController.setupController();

    UIManager.connectUIElements();

	renderer.render(scene, camera);
    const loader = new three.TextureLoader();
    loader.load('textures/Craters.png', function(texture) {
        normalMap = texture;
        normalMap.colorSpace = three.SRGBColorSpace;
        normalMap.minFilter = three.LinearMipmapLinearFilter;


        noise.seed(1)

        let box = new three.BoxGeometry(50 * Math.random(), 1, 20 * Math.random());
        let sphere = new three.SphereGeometry(2);

        // let bufferGeometry1 = new three.BufferGeometry().fromGeometry(box);
        // let bufferGeometry2 = new three.BufferGeometry().fromGeometry(sphere);


        let mergedGeometry = BufferGeometryUtils.mergeGeometries([box, sphere]);


        let m = new three.MeshPhongMaterial({
            color:0xFFFFFF
        })

        //scene.add(new three.Mesh(mergedGeometry, m))
        water = createSquare(new three.Vector3(0, 0, 0), 100, 200);
        scene.add(water);

        
        requestAnimationFrame(Update);
    })
}



let normalMap;
let raycaster;
let water;
function Update(time) {

    PlayerController.movePlayer(controls);
    //InfiniteTerrain.updateVisibleChunks(new three.Vector2(camera.position.x, camera.position.z), scene);

    

    UIManager.displayFPS();
    let x = (canvas.width / 2 / canvas.width) * 2 - 1;
    let y = - (canvas.height / 2 / canvas.height) * 2 + 1;

    water.material.uniforms.u_Time.value = time;

   
    renderer.render(scene, camera);
    requestAnimationFrame(Update);
}



function createSquare(position, size, resolution) {
    const geometry = new three.BufferGeometry();

    let newCorner = new three.Vector3(-size / 2, 0, -size / 2);

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
    // const material = new three.MeshPhongMaterial({
    //     color: 0xFFFFFF, 
    //     wireframe: true,
    // });
    const material = new three.ShaderMaterial({
        uniforms: {
            u_LightPos: { value: new three.Vector3(100, 100, 100) }, 
            u_FragColor: { value: new three.Color(0, 0, 1) },
            u_Time: { type: "f", value: 0 }
        },
        vertexShader: `
            varying vec3 v_Position;
            varying vec3 v_Normal;

            uniform float u_Time;

            struct Wave {
                float amplitude;
                float wavelength;
                float speed;
                
                vec2 dir;
            };

            float waveCoord(vec3 p, Wave w) {
                return p.x * w.dir.x + p.z * w.dir.y;
            }

            float waveHeight(vec3 p, Wave w) {
                float xz = waveCoord(p, w);
                float frequency = 2.0 / w.wavelength;
                float phase = w.speed * frequency;

                float x = w.amplitude * sin(xz * frequency + u_Time * phase);
                return x;
            }

            vec3 waveNormal(vec3 p, Wave w) {
                float xz = waveCoord(p, w);
                float frequency = 2.0 / w.wavelength;
                float phase = w.speed * frequency;

                float dx = frequency * w.amplitude * w.dir.x * cos(xz * frequency + u_Time * phase);
                float dz = frequency * w.amplitude * w.dir.y * cos(xz * frequency + u_Time * phase);

                return vec3(dx, 1.0, dz);
            }

            float rand(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            void main() {
                Wave w;
                w.amplitude = 1.0;
                w.wavelength = 16.0;
                w.speed = 0.025;
                w.dir = vec2(1.0);

                int numWaves = 4;
                float height = 0.0;
                vec3 normal = vec3(0.0);
                for (int i = 0; i < numWaves; i++) {
                    height += waveHeight(position, w);
                    normal += waveNormal(position, w);
                    w.amplitude /= 2.0;
                    w.wavelength /= 2.0;
                    w.speed /= 2.0;
                    w.dir = vec2(rand(w.dir), rand(w.dir));
                }

                v_Position = vec3(position.x, height, position.z);
                v_Normal = normal;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(v_Position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 u_LightPos;
            uniform vec3 u_FragColor;
            varying vec3 v_Position;
            varying vec3 v_Normal;
            void main() {
                vec3 L = normalize(u_LightPos - v_Position);
                vec3 N = normalize(v_Normal);

                vec3 k_d = vec3(1, 1, 1);
                vec3 diffuse = max(dot(L, N), 0.0) * u_FragColor;

                vec3 ambient = u_FragColor;  //vec3(0.0, 0.0, 0.3);

                gl_FragColor = vec4(diffuse, 1.0);
            }
        `
    });
    


    const mesh = new three.Mesh(geometry, material);

    return mesh;
}


main();