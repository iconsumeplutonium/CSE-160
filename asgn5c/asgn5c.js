import * as three from 'three';
import * as PlayerController from './PlayerController.js';
import * as CubeSphere from './CubeSphere.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import datGui from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/+esm'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export { three };

const fov = 75;
const aspect = 2;
const near = 0.1;
const far = 100;

let renderer, scene, camera, directionalLight, canvas;
let cubeGeometry, icosahedronGeo, sphereGeo;
let material, loader;
let cubes = [];
let interceptor;

let controls;

function main() {

	canvas = document.getElementById('webgl');
	renderer = new three.WebGLRenderer( { antialias: true, canvas } );

	camera = new three.PerspectiveCamera(90, canvas.width / canvas.height, 0.1, 500);
    camera.rotation.x = -Math.PI / 2;
    camera.rotation.y = -1;
    camera.rotation.z = -Math.PI / 2;

    camera.position.x = -1;
    camera.position.y = 1;
	camera.position.z = 0;

	scene = new three.Scene();

    // let geometry = new three.PlaneGeometry(10, 10, 100, 100);
	// let material = new three.MeshPhongMaterial({color: 0x44aa88, wireframe: true});

	// let cube = new three.Mesh(geometry, material);
    // cube.rotation.x = 3 * Math.PI / 2;
    // cube.position.y = -1;
	// scene.add(cube);
    //CubeSphere.createSquare(new three.Vector3(0, 0, 0), scene, 50, 10);
    //CubeSphere.createCubeFace(new three.Vector3(0, 0, 0), 1000, 2, 10, 10, scene);
    let c = new CubeSphere.CubeSphere(new three.Vector3(0, 0, 0), 100, scene);

    let light = new three.PointLight(0xFFFFFF, 10, 0, 0);
    light.position.set(2, 20, 0);
    scene.add(light);

    light = new three.AmbientLight(0xFFFFFF, 3);
    scene.add(light);

    controls = new PointerLockControls(camera, document.body);
    canvas.addEventListener('click', function() {
        controls.lock();
    });

    controls.connect();
    

    scene.add(controls.getObject())
    PlayerController.setupController();

	renderer.render(scene, camera);
    requestAnimationFrame(Update)
}


let lastCalledTime, fps, delta;
let yCoord = 0;
let fpsCounter = document.getElementById("fpsCounter");
let clock = new three.Clock();
function Update(time) {

    PlayerController.movePlayer(controls);

    //console.log(camera.rotation.x, camera.rotation.y, camera.rotation.z);
    displayFPS();

    renderer.render(scene, camera);
    requestAnimationFrame(Update);
}


function displayFPS() {
    //fps counter code from https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html
    if (!lastCalledTime) {
        lastCalledTime = Date.now();
        fps = 0;
    } else {
        delta = (Date.now() - lastCalledTime) / 1000;
        lastCalledTime = Date.now();
        fps = 1/delta;
    }

    fpsCounter.innerText = "FPS: " + fps.toFixed(3);
}

main();