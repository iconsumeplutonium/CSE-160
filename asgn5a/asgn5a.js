import * as three from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';

const fov = 75;
const aspect = 2;
const near = 0.1;
const far = 10;

const color = 0xFFFFFF;
const intensity = 1;

let renderer, scene, camera;
let cubeGeometry, icosahedronGeo, sphereGeo;
let material, loader;
let cubes = [];
let interceptor;

function main() {
    const canvas = document.querySelector("#webgl");
    renderer = new three.WebGLRenderer({antialias : true, canvas});

    camera = new three.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    scene = new three.Scene();

    const light = new three.DirectionalLight(color, intensity);
    light.position.set(0, 1, 4);
    scene.add(light);


    cubeGeometry = new three.BoxGeometry(1, 1, 1);
    icosahedronGeo = new three.IcosahedronGeometry(1.5, 0);
    sphereGeo = new three.SphereGeometry(0.5, 32, 32);




    loader = new three.TextureLoader();
   

    createImpulseCommandBlock(0, 0, -1);
    createIcosaHedron(-2, 0, -0.7);
    createLinusSphere(2, 0, -0.7);

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

    // interceptor = objLoader.load('model/tie_interceptor.obj');
    // scene.add(interceptor);


    renderer.render(scene, camera);
    requestAnimationFrame(render);
}


let lastCalledTime, fps, delta;
let yCoord = 0;
let fpsCounter = document.getElementById("fpsCounter");
function render(time) {
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

        if (angle < 0.1) {
            let rand = Math.random();
            yCoord = Math.round(rand * 2 - 1);

            console.log("here");
        }

        console.log(yCoord)

        let r = 4;
        let x = r * Math.cos(angle);
        let y = r * Math.sin(angle);
        interceptor.position.set(x, yCoord, y);

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

main();