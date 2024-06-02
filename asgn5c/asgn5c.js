import * as three from 'three';
import * as PlayerController from './PlayerController.js';
import * as CubeSphere from './CubeSphere.js';
import * as UIManager from './UIManager.js';
import * as LookupTable from './LookupTable.js';
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
    let dirLight = new three.DirectionalLight( 0xffffff, 1.5);
    dirLight.position.set(1, 9999999, 1)
    scene.add( dirLight );

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
        marchingCubes(new three.Vector3(0, 0, 0))
        marchingCubes(new three.Vector3(-20, 0, 0))
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
    //c.setWireframeVisibility(UIManager.wireframeViewCheckbox.checked);

    renderer.render(scene, camera);
    requestAnimationFrame(Update);
}


const surfaceLevel = 0.5;
const size = 20;
const offset = Math.random();
function marchingCubes(startPos) {
    let allVerts = [];
    noise.seed(0)
    for (let i = startPos.x; i < 40 + startPos.x; i++) {
        for (let j = startPos.y; j < size + startPos.y; j++) {
            for (let k = startPos.z; k < size + startPos.z; k++) {
                //let sample = noise.simplex3(i + offset, j + offset, k + offset)
                let sample = Noise.FBM(40, 8, 0.5, 2, new three.Vector3(i + offset, j + offset, k + offset));
                //console.log(i, j, k, sample)
                allVerts.push(new three.Vector4(i, j, k, sample));
            }
        }
    }

    // allVerts.push(new three.Vector4(0, 0, 0, 0));
    // allVerts.push(new three.Vector4(0, 0, 1, 0));
    // allVerts.push(new three.Vector4(0, 1, 0, 0));
    // allVerts.push(new three.Vector4(0, 1, 1, 1));
    // allVerts.push(new three.Vector4(1, 0, 0, 0));
    // allVerts.push(new three.Vector4(1, 0, 1, 0));
    // allVerts.push(new three.Vector4(1, 1, 0, 0));
    // allVerts.push(new three.Vector4(1, 1, 1, 0));

    const geometry = new three.BufferGeometry();
    let verts = [];
    for (let i = 0; i < size - 1; i++) {
        for (let j = 0; j < size - 1; j++) {
            for (let k = 0; k < size - 1; k++) {

                let corners = [];
                corners.push(coordToIndex(i,     j,     k    ));
                corners.push(coordToIndex(i + 1, j,     k    ));
                corners.push(coordToIndex(i + 1, j,     k + 1));
                corners.push(coordToIndex(i,     j,     k + 1));
                corners.push(coordToIndex(i,     j + 1, k    ));
                corners.push(coordToIndex(i + 1, j + 1, k    ));
                corners.push(coordToIndex(i + 1, j + 1, k + 1));
                corners.push(coordToIndex(i,     j + 1, k + 1));

                //calculate halfway vectors for each edge, based on https://paulbourke.net/geometry/polygonise/polygonise1.gif
                let edges = [];
                edges.push(new three.Vector3(i + 0.5, j,       k      ));
                edges.push(new three.Vector3(i + 1,   j,       k + 0.5));
                edges.push(new three.Vector3(i + 0.5, j,       k + 1  ));
                edges.push(new three.Vector3(i,       j,       k + 0.5));
                edges.push(new three.Vector3(i + 0.5, j + 1,   k      ));
                edges.push(new three.Vector3(i + 1,   j + 1,   k + 0.5));
                edges.push(new three.Vector3(i + 0.5, j + 1,   k + 1  ));
                edges.push(new three.Vector3(i,       j + 1,   k + 0.5));
                edges.push(new three.Vector3(i,       j + 0.5, k      ));
                edges.push(new three.Vector3(i + 1,   j + 0.5, k      ));
                edges.push(new three.Vector3(i + 1,   j + 0.5, k + 1  ));
                edges.push(new three.Vector3(i,       j + 0.5, k + 1  ));
                
                let index = 0;
                for (let p = 0; p < 8; p++) {
                    //console.log(allVerts[corners[p]])
                    if (allVerts[corners[p]].w <= surfaceLevel)
                        index |= Math.pow(2, p);
                }

                // let activeEdgesHex = LookupTable.edgeTable[index];
                // let activeEdges = LookupTable.getActiveEdges(activeEdgesHex);

                //console.log(index)

                let activeTris = LookupTable.triTable[index];
                for (let x = 0; activeTris[x] != -1; x += 3) {
                    let p1 = edges[activeTris[x]];
                    let p2 = edges[activeTris[x + 1]];
                    let p3 = edges[activeTris[x + 2]];
                    
                    verts.push(p1.x + startPos.x, p1.y + startPos.y, p1.z + startPos.z, p2.x + startPos.x, p2.y + startPos.y, p2.z + startPos.z, p3.x + startPos.x, p3.y + startPos.y, p3.z + startPos.z);
                }
            }
        }
    }

    //console.log(verts)

    geometry.setAttribute('position', new three.BufferAttribute(new Float32Array(verts), 3));

    // for (let i = 0; i < allVerts.length; i++) {
    //     // let sample = (noise.simplex3(i + offset, j + offset, k + offset) + 1) / 2;
    //     // if (sample > surfaceLevel)
    //     //     continue;
    //     if (allVerts[i].w > surfaceLevel)
    //         continue;
    //     //const col = (sample < surfaceLevel) ? 0x0000FF : 0xFFFFFF;

    //     //const geo = new three.BoxGeometry(1, 1, 1);
    //     const geo = new three.SphereGeometry(0.1, 10, 10);
    //     const mat = new three.MeshPhongMaterial({
    //         color: 0xFFFFFF
    //     });

    //     const m = new three.Mesh(geo, mat);
    //     m.position.x =  allVerts[i].x;
    //     m.position.y =  allVerts[i].y;
    //     m.position.z =  allVerts[i].z;
    //     scene.add(m);
            
    // }

    geometry.computeVertexNormals()
    const material = new three.MeshPhongMaterial({
        color: 0xFFFFFF * Math.random(),
        side: three.DoubleSide
    });
    const mesh = new three.Mesh(geometry, material);


    scene.add(mesh);
}

function coordToIndex(x, y, z) {
    return (z * size * size) + (y * size) + x;
}



main();