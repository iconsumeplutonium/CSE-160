import * as three from 'three';
import * as PlayerController from './PlayerController.js';
import * as CubeSphere from './CubeSphere.js';
import * as UIManager from './UIManager.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import datGui from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/+esm'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export { three };

let renderer, scene, camera, directionalLight, canvas;
let cubeGeometry, icosahedronGeo, sphereGeo;
let material, loader;
let cubes = [];
let interceptor;

let controls;

function main() {

	canvas = document.getElementById('webgl');
	renderer = new three.WebGLRenderer( { antialias: true, canvas } );

	camera = new three.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 10000);
    camera.rotation.x = -Math.PI / 2;
    camera.rotation.y = -1;
    camera.rotation.z = -Math.PI / 2;

    camera.position.x = -10;
    camera.position.y = 10;
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
    
    //c.makeMeshes(100, 1, slider1.value / 100, scene)
    

    // let light = new three.PointLight(0xFFFFFF, 10, 0, 2);
    // light.position.set(0, 20, 0);
    // scene.add(light);asd
    let dirLight = new three.DirectionalLight( 0xffffff, 3 );
    dirLight.position.set(1, 9999999, 1)
    scene.add( dirLight );

    ;let light = new three.AmbientLight(0xFFFFFF, 0.1);
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
        console.log(normalMap)
        c = new CubeSphere.CubeSphere(new three.Vector3(0, 0, 0), 100, scene, normalMap)
        requestAnimationFrame(Update);
    })
}



let normalMap;
let c;
function Update(time) {

    PlayerController.movePlayer(controls);

    UIManager.displayFPS();

    // scene.remove(c);

    // //c = new CubeSphere.CubeSphere(new three.Vector3(0, 0, 0), 100, scene, slider1.value / 100)
    // c.makeMeshes(100, 1, slider1.value / 100, scene)
    c.setWireframeVisibility(UIManager.wireframeViewCheckbox.checked);

    renderer.render(scene, camera);
    requestAnimationFrame(Update);
}




main();