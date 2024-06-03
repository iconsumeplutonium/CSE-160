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

	camera = new three.PerspectiveCamera(90, canvas.width / canvas.height, 0.1, 100);
    camera.rotation.x = -Math.PI / 2;
    camera.rotation.y = -1;
    camera.rotation.z = -Math.PI / 2;

    camera.position.x = -10;
    camera.position.y = 10;
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


        
        requestAnimationFrame(Update);
    })
}



let normalMap;
let raycaster;
function Update(time) {

    PlayerController.movePlayer(controls);
    InfiniteTerrain.updateVisibleChunks(new three.Vector2(camera.position.x, camera.position.z), scene);

    

    UIManager.displayFPS();
    let x = (canvas.width / 2 / canvas.width) * 2 - 1;
    let y = - (canvas.height / 2 / canvas.height) * 2 + 1;

   

   
    renderer.render(scene, camera);
    requestAnimationFrame(Update);
}


main();