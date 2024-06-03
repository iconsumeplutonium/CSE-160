import * as three from 'three';
import * as PlayerController from './PlayerController.js';
import * as CubeSphere from './CubeSphere.js';
import * as UIManager from './UIManager.js';
import * as LookupTable from './LookupTable.js';
import * as Noise from './Noise.js';
import {Chunk} from './Chunk.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import datGui from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/+esm'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { createNoise3D } from './simplex-noise.js';

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
    // scene.add(light);
    let dirLight = new three.DirectionalLight(0xFFFFFF, 1.5);
    dirLight.position.set(10, 99, 10);
    scene.add(dirLight);

    // flashlight = new three.SpotLight(0xFFFFFF, 1, 0, Math.PI / 8, 0, 0);
    // scene.add(flashlight);

    

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
        //console.log(normalMap)
        //c = new CubeSphere.CubeSphere(new three.Vector3(0, 0, 0), 100, scene, normalMap)

        noise.seed(1)
        const surfaceLevel = 0.5;
        const size = 10;
        c1 = new Chunk(new three.Vector3(size, size, size), new three.Vector3(0, 0, 0), scene, surfaceLevel);
        let c2 = new Chunk(new three.Vector3(size, size, size), new three.Vector3(0, 0, 1), scene, surfaceLevel);
        let c3 = new Chunk(new three.Vector3(size, size, size), new three.Vector3(0, 1, 0), scene, surfaceLevel);
        // let c4 = new Chunk(new three.Vector3(size, size, size), new three.Vector3(0, 1, 1), scene, surfaceLevel);
        // let c5 = new Chunk(new three.Vector3(size, size, size), new three.Vector3(1, 0, 0), scene, surfaceLevel);
        // let c6 = new Chunk(new three.Vector3(size, size, size), new three.Vector3(1, 0, 1), scene, surfaceLevel);
        // let c7 = new Chunk(new three.Vector3(size, size, size), new three.Vector3(1, 1, 1), scene, surfaceLevel);
        raycaster = new three.Raycaster();
        pointer = new three.Vector2();

        document.addEventListener('pointermove', function(ev) {
            pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
			pointer.y = -(ev.clientY / window.innerHeight) * 2 + 1;
        });

        document.addEventListener('mousedown', function(event) {
            if (event.which === 1)
                cursorStatus = 1;
            else if (event.which === 3)
                cursorStatus = 2; 
        });

        document.addEventListener('mouseup', function(event) {
            cursorStatus = 0;
        })


        let geometry = new three.BufferGeometry();
        geometry.setAttribute('position', new three.BufferAttribute( new Float32Array(4 * 3), 3));

        let material = new three.LineBasicMaterial( { color: 0xFFFFFF, transparent: true } );

        line = new three.Line( geometry, material );
        scene.add( line );
        line = new three.Line(geometry, material);

        
        requestAnimationFrame(Update);
    })
}

let cursorStatus = 0;

let normalMap;
let c1;
let raycaster, pointer;
const seed = 0;
let line;
function Update(time) {

    PlayerController.movePlayer(controls);

    UIManager.displayFPS();
    let x = (canvas.width / 2 / canvas.width) * 2 - 1;
    let y = - (canvas.height / 2 / canvas.height) * 2 + 1;

    raycaster.setFromCamera(new three.Vector2(x, y), camera);

    //console.log(cursorStatus);

   
    // const intersection = raycaster.intersectObject(c1.mesh);
    //     if (intersection.length > 0) {
    //         console.log("intersection");

    //         const intersect = intersection[0];
    //         const face = intersect.face;

    //         const linePosition = line.geometry.attributes.position;
    //         const meshPosition = c1.mesh.geometry.attributes.position;

    //         console.log(intersect.point)
    //         if (cursorStatus != 0) {
    //         if (intersect.point) {
    //             let m = c1.getMap();
            
    //             m[Math.round(intersect.point.x)][Math.round(intersect.point.y)][Math.round(intersect.point.z)] += 0.2 * (cursorStatus == 1) ? 1 : -1;

    //             c1.setMap(m);
    //         }

    //         linePosition.copyAt(0, meshPosition, face.a);
    //         linePosition.copyAt(1, meshPosition, face.b);
    //         linePosition.copyAt(2, meshPosition, face.c);
    //         linePosition.copyAt(3, meshPosition, face.a);

    //         c1.mesh.updateMatrix();

    //         line.geometry.applyMatrix4(c1.mesh.matrix );

    //         line.visible = true;
    //     } 
    // }

    // scene.remove(c);

    // //c = new CubeSphere.CubeSphere(new three.Vector3(0, 0, 0), 100, scene, slider1.value / 100)
    // c.makeMeshes(100, 1, slider1.value / 100, scene)
    //c.setWireframeVisibility(UIManager.wireframeViewCheckbox.checked);
    // flashlight.rotation.x = controls.camera.rotation.x
    // flashlight.rotation.y = controls.camera.rotation.y;
    // flashlight.rotation.z = controls.camera.rotation.z;

    // flashlight.position.x = controls.camera.position.x
    // flashlight.position.y = controls.camera.position.y;
    // flashlight.position.z = controls.camera.position.z;

    renderer.render(scene, camera);
    requestAnimationFrame(Update);
}


main();