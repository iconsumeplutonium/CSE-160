import * as three from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import datGui from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/+esm'

const fov = 75;
const aspect = 2;
const near = 0.1;
const far = 100;

let renderer, scene, camera, directionalLight;
let cubeGeometry, icosahedronGeo, sphereGeo;
let material, loader;
let cubes = [];
let interceptor;

let controls;

function main() {
    const canvas = document.querySelector("#webgl");
    renderer = new three.WebGLRenderer({antialias : true, canvas});

    camera = new three.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    const gui = new datGui.GUI();
    gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
    const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
    gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
    gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);

    scene = new three.Scene();

    let color = 0xFFFFFF;
    let intensity = 5;
    directionalLight = new three.DirectionalLight(color, intensity);
    directionalLight.position.set(0, 1, 4);
    let lightGUI = new datGui.GUI();
    lightGUI.addColor(new ColorGUIHelper(directionalLight, 'color'), 'value').name('color');
    lightGUI.add(directionalLight, 'intensity', 0, intensity, 0.01);
    scene.add(directionalLight);

    color = 0xFFFFFF;
    intensity = 1;
    let ambientLight = new three.AmbientLight(color, intensity);
    scene.add(ambientLight);



    let hemisphereLight = new three.HemisphereLight(0xB1E1FF, 0xB97A20, 1);
    let hemisphereLightGUI = new datGui.GUI();
    hemisphereLightGUI.addColor(new ColorGUIHelper(hemisphereLight, 'color'), 'value').name('skyColor');
    hemisphereLightGUI.addColor(new ColorGUIHelper(hemisphereLight, 'groundColor'), 'value').name('groundColor');
    hemisphereLightGUI.add(hemisphereLight, 'intensity', 0, 2, 0.01);
    scene.add(hemisphereLight);



    cubeGeometry = new three.BoxGeometry(1, 1, 1);
    icosahedronGeo = new three.IcosahedronGeometry(1.5, 0);
    sphereGeo = new three.SphereGeometry(0.5, 32, 32);

    loader = new three.TextureLoader();
    createImpulseCommandBlock(0, 0, -1);
    createIcosaHedron(-2, 0, -0.7);
    createLinusSphere(2, 0, -0.7);

    let geometries = [
        new three.BoxGeometry(1, 1, 1),
        new three.ConeGeometry(1, Math.random() * 4),
        new three.CylinderGeometry(1, 1, Math.random() * 4),
        new three.DodecahedronGeometry(Math.random() * 2),
        new three.OctahedronGeometry(Math.random() * 2),
        new three.RingGeometry(1, (Math.random() * 3) + 1),
        new three.SphereGeometry(Math.random() * 2),
        new three.TetrahedronGeometry(Math.random() * 2),
        new three.TorusGeometry((Math.random() * 2) + 1, 1),
        new three.TorusKnotGeometry((Math.random() * 2) + 1, 1),
        new three.SphereGeometry(Math.random() * 2),
        new three.SphereGeometry(Math.random() * 2),
        new three.TetrahedronGeometry(Math.random() * 2),
        new three.TorusGeometry((Math.random() * 2) + 1, 1),
        new three.TorusKnotGeometry((Math.random() * 2) + 1, 1),
        new three.SphereGeometry(Math.random() * 2)        
    ]
    for (let i = 0; i < geometries.length; i++) {
        let randX = (Math.random() * 2 - 1) * 4;
        let randY = (Math.random() * 2 - 1) * 4;
        let randZ = (Math.random() * 2 - 1) * 4;
        createShape(geometries[i], randX, randY, randZ);
    }

    controls = new OrbitControls( camera, renderer.domElement );




    


    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    mtlLoader.load('model/tie_interceptor.mtl', (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
    })
    objLoader.load('model/tie_interceptor.obj', (root) => {
        interceptor = root;
        interceptor.scale.set(1.4, 1.4, 1.4);
        //interceptor.rotation.set(0, 5.75, -0.3);
        interceptor.position.set(0, 0, -1);
        scene.add(interceptor);
    });


    const planeSize = 40;
     
    loader = new three.TextureLoader();
    const texture = loader.load('textures/checker.png');
    texture.wrapS = three.RepeatWrapping;
    texture.wrapT = three.RepeatWrapping;
    texture.magFilter = three.NearestFilter;
    texture.colorSpace = three.SRGBColorSpace;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new three.PlaneGeometry(planeSize, planeSize);
    const planeMat = new three.MeshPhongMaterial({
      map: texture,
      side: three.DoubleSide,
    });
    const mesh = new three.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    mesh.position.y = -5;
    scene.add(mesh);


    let loader1 = new three.CubeTextureLoader();
    let skyboxTexture = loader1.load([
      'textures/skybox/pos-x.jpg',
      'textures/skybox/neg-x.jpg',
      'textures/skybox/pos-y.jpg',
      'textures/skybox/neg-y.jpg',
      'textures/skybox/pos-z.jpg',
      'textures/skybox/neg-z.jpg',
    ]);
    scene.background = skyboxTexture;



    renderer.render(scene, camera);
    requestAnimationFrame(render);
}


let lastCalledTime, fps, delta;
let yCoord = 0;
let fpsCounter = document.getElementById("fpsCounter");
function render(time) {
    controls.update();
    time *= 0.001;

    for (let i = 0; i < cubes.length; i++) {
        if (i != 2)
            cubes[i].rotation.x = time * (1 + i * 0.1);
        cubes[i].rotation.y = time * (1 + i * 0.1);

        if (i == 1) {
            let r = Math.abs(Math.sin(time));
            let g = Math.abs(Math.sin(time + 4.5));
            let b = Math.abs(Math.sin(time + 2.3));
            cubes[i].material.color.setRGB(r, g, b)
        }
    };

    renderer.render(scene, camera);

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


    if (interceptor) {
        let speed = 2;
        let angle = (time * speed) % (Math.PI * 2);

        // if (angle < 0.1) {
        //     yCoord = Math.round(Math.random() * 2 - 1);
        // }

        let r = 4;
        let x = r * Math.cos(angle);
        let y = r * Math.sin(angle);
        interceptor.position.set(x, 0, y);
        directionalLight.position.set(x, 0, y);

        //directionalLight.position.y = yCoord;

        let nextAngle = ((time * speed) + 0.1) % (Math.PI * 2);
        let nextX = r * Math.cos(nextAngle);
        let nextY = r * Math.sin(nextAngle);
        interceptor.lookAt(new three.Vector3(nextX, yCoord, nextY));
    }



    requestAnimationFrame(render);
}


function createImpulseCommandBlock(x, y, z) {
    let material = [
        new three.MeshPhongMaterial({map: loadColorTexture('textures/cmd_face_2.png')}),
        new three.MeshPhongMaterial({map: loadColorTexture('textures/cmd_face_2.png')}),
        new three.MeshPhongMaterial({map: loadColorTexture('textures/cmd_face_1.png')}),
        new three.MeshPhongMaterial({map: loadColorTexture('textures/cmd_face_3.png')}),
        new three.MeshPhongMaterial({map: loadColorTexture('textures/cmd_face_2.png')}),
        new three.MeshPhongMaterial({map: loadColorTexture('textures/cmd_face_2.png')}),
    ];

    const cube = new three.Mesh(cubeGeometry, material);
    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;

    cubes.push(cube);
    scene.add(cube);    
}

function createIcosaHedron(x, y, z) {
    let material = new three.MeshPhongMaterial({color: 0x44aa88});

    const ih = new three.Mesh(icosahedronGeo, material);
    ih.position.x = x;
    ih.position.y = y;
    ih.position.z = z;

    let scaleFactor = 4;
    ih.scale.x /= scaleFactor;
    ih.scale.y /= scaleFactor;
    ih.scale.z /= scaleFactor;

    cubes.push(ih);
    scene.add(ih);    
}

function createLinusSphere(x, y, z) {
    let material = new three.MeshPhongMaterial({map: loadColorTexture('textures/equirectangular_linus_tech_tips.jpg')})

    const sphere = new three.Mesh(sphereGeo, material);
    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;

    cubes.push(sphere);
    scene.add(sphere);    
}


function loadColorTexture(path) {
    const texture = loader.load(path);
    texture.colorSpace = three.SRGBColorSpace;
    texture.minFilter = three.LinearMipmapLinearFilter;
    return texture;
}

function updateCamera() {
    camera.updateProjectionMatrix();
}

function createShape(geometry, locationX, locationY, locationZ) {
    let material = new three.MeshPhongMaterial({color: new three.Color(Math.random(), Math.random(), Math.random())});

    const ih = new three.Mesh(geometry, material);
    ih.position.x = locationX;
    ih.position.y = locationY;
    ih.position.z = locationZ;

    let scaleFactor = 4;
    ih.scale.x /= scaleFactor;
    ih.scale.y /= scaleFactor;
    ih.scale.z /= scaleFactor;

    cubes.push(ih);
    scene.add(ih);
}

main();