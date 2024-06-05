import * as three from 'three';
import * as PlayerController from './PlayerController.js';
import * as UIManager from './UIManager.js';
import * as WaterShader from './WaterShader.js';
import * as UnderwaterShader from './UnderwaterShader.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import datGui from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/+esm'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

export { three };

export let camera;

let renderer, scene, canvas;
let controls;
let water;
let light;
let textureCube;
let composer;
let postProcess;

//false: orbit controls (default)
//true: pointer lock controls (for testing purposes)
let useFirstPersonControls = false;

function main() {

	canvas = document.getElementById('webgl');
	renderer = new three.WebGLRenderer( { antialias: true, canvas } );

	camera = new three.PerspectiveCamera(50, canvas.width / canvas.height, 0.1, 1000);
    camera.rotation.x = -Math.PI / 2;
    camera.rotation.y = -Math.PI / 2;
    camera.rotation.z = -Math.PI / 2;

    camera.position.x = -70;
    camera.position.y = 30;
	camera.position.z = 0;
	scene = new three.Scene();


    if (useFirstPersonControls) {
        controls = new PointerLockControls(camera, document.body);

        canvas.addEventListener('click', function() {
            controls.lock();
        });

        controls.connect();
        scene.add(controls.getObject())

    } else {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.maxDistance = 250;
    }

    if (useFirstPersonControls)
        PlayerController.setupController();

    UIManager.connectUIElements();

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
    water = createSquare(size, size);
    scene.add(water);

    let lightSize = 5;
    let box = new three.BoxGeometry(lightSize, lightSize, lightSize);
    let mat = new three.MeshBasicMaterial({color: 0xFFFF00});
    light = new three.Mesh(box, mat);
    light.position.y = 200;
    scene.add(light);


    let postProcessShader = {
        uniforms: {
            "tDiffuse": { type: "t", value: null },
            "u_CameraPos":   { value: camera.position.clone() },
        },
    
        vertexShader: UnderwaterShader.vertexShader,    
        fragmentShader: UnderwaterShader.fragmentShader
    };


    
    let renderPass = new RenderPass(scene, camera);
    postProcess = new ShaderPass(postProcessShader);

    composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(postProcess);

    
    requestAnimationFrame(Update);
}


function Update(time) {

    if (useFirstPersonControls)
        PlayerController.movePlayer(controls);
    UIManager.displayFPS();

    water.material.uniforms.u_Time.value = time;
    water.material.uniforms.u_CameraPos.value = camera.position.clone()

    let lightPos = new three.Vector3(slider1.value, 200, slider3.value);
    light.position.x = lightPos.x;
    light.position.y = lightPos.y;
    light.position.z = lightPos.z;
    water.material.uniforms.u_LightPos.value = lightPos.normalize();

    water.material.uniforms.useEnvReflct.value = UIManager.envReflectCheckbox.checked;
    water.material.uniforms.useScattering.value = UIManager.scatteringCheckbox.checked;

    water.material.uniforms.u_FragColor.value = UIManager.getLightColor();
   
    postProcess.material.uniforms.u_CameraPos.value = camera.position.clone();

    composer.render()
    requestAnimationFrame(Update);    
}



function createSquare(size, resolution) {
    const geometry = new three.BufferGeometry();

    let newCorner = new three.Vector3(-size / 2, 50, -size / 2);

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
        vertexShader: WaterShader.vertexShader,
        fragmentShader: WaterShader.fragmentShader,
        side: three.DoubleSide
    });;

    const mesh = new three.Mesh(geometry, material);

    return mesh;
}


main();