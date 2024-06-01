import * as three from 'three';
import { createNoise2D, createNoise3D } from './simplex-noise.js';

//https://threejs.org/docs/#api/en/core/BufferGeometry
//adapted from https://github.com/SebLague/Procedural-Planets/blob/master/Procedural%20Planet%20E01/Assets/TerrainFace.cs
export function createSquare(resolution, localUp, radius, normalMap) {
    let axisA = new three.Vector3(localUp.y, localUp.z, localUp.x);
    let axisB = localUp.clone().cross(axisA);

    let vertices = new Float32Array(resolution * resolution * 3);
    let uvs = new Float32Array(resolution * resolution * 2); 
    let triangles = new Uint32Array((resolution - 1) * (resolution - 1) * 6);
    let triIndex = 0;

    const noiseScale = 0.5
    for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
            let i = x + y * resolution;
            let percent = new three.Vector2(x, y).divideScalar(resolution - 1);
            let pointOnUnitCube = localUp.clone().add(axisA.clone().multiplyScalar((percent.x - 0.5) * 2)).add(axisB.clone().multiplyScalar((percent.y - 0.5) * 2));

            let pointOnUnitSphere = pointOnUnitCube.normalize();

            let height = (Noise.FBM(noiseScale, 8, 0.5, 2, pointOnUnitSphere) + 1) / 2;

            let idk = noise.simplex3(pointOnUnitSphere.x, pointOnUnitSphere.y, pointOnUnitSphere.z);
            height = three.MathUtils.lerp(height, 0, idk)
            //height = bias2(height)

            pointOnUnitSphere.multiplyScalar(radius + height)
            vertices.set([pointOnUnitSphere.x, pointOnUnitSphere.y, pointOnUnitSphere.z], i * 3);

            uvs.set([percent.x, percent.y], i * 2);

            if (x != resolution - 1 && y != resolution - 1) {
                triangles[triIndex] = i;
                triangles[triIndex + 1] = i + resolution + 1;
                triangles[triIndex + 2] = i + resolution;

                triangles[triIndex + 3] = i;
                triangles[triIndex + 4] = i + 1;
                triangles[triIndex + 5] = i + resolution + 1;
                triIndex += 6;
            }
        }
    }





    const geometry = new three.BufferGeometry();
    geometry.setAttribute('position', new three.BufferAttribute(vertices, 3));
    geometry.setIndex(new three.BufferAttribute(triangles, 1));
    geometry.setAttribute('uv', new three.BufferAttribute(uvs, 2));
    geometry.computeVertexNormals()
    geometry.computeTangents()

    const material = new three.MeshPhongMaterial({ 
        wireframe: false,
        // normalMap: normalMap,
        // normalScale: new three.Vector2(0.1, 0.1),
        // color: 0xaaa7a6
    });

    
    // material.bumpMap = normalMap;
    // console.log(material.bumpMap)
    // material.normalScale.set(1, 1);
    // material.needsUpdate = true;
    // material.normalMap = three.TangentSpaceNormalMap
    const mesh = new three.Mesh(geometry, material);


    return mesh;


    
}

function bias(x) {
    const bias = 0.55;
    const k = Math.pow(1 - bias, 3);

    return (x * k) / (x * k - x + 1);
}

function bias2(x) {
    return Math.exp(4 * (x - 1));
}


export class CubeSphere {
    constructor(position, s1, scene, normalMap) {
        this.meshes = [];
        const faceResolution = 500;
        const radius = 10;
        
        let topFace = createSquare(faceResolution, new three.Vector3(0, 1, 0), radius, normalMap);
        this.meshes.push(topFace);

        let bottomFace = createSquare(faceResolution, new three.Vector3(0, -1, 0), radius, normalMap);
        this.meshes.push(bottomFace);

        let frontFace = createSquare(faceResolution, new three.Vector3(0, 0, 1), radius, normalMap);
        this.meshes.push(frontFace);

        let backFace = createSquare(faceResolution, new three.Vector3(0, 0, -1), radius, normalMap);
        this.meshes.push(backFace);

        let leftFace = createSquare(faceResolution, new three.Vector3(1, 0, 0), radius, normalMap);
        this.meshes.push(leftFace);
        
        let rightFace = createSquare(faceResolution, new three.Vector3(-1, 0, 0), radius, normalMap);
        this.meshes.push(rightFace);


        for (let i = 0; i < this.meshes.length; i++)
            scene.add(this.meshes[i]);

        //this.makeMeshes(faceResolution, radius, normalMap, scene);
    }

    setWireframeVisibility(value) {
        for (let i = 0; i < this.meshes.length; i++)
            this.meshes[i].material.wireframe = value;
    }

    // makeMeshes(faceResolution, radius, normalMap, scene) {
    //     for (let i = 0; i < this.meshes.length; i++)
    //         scene.remove(this.meshes[i]);
    //     this.meshes = []

    //     let topFace = createSquare(faceResolution, new three.Vector3(0, 1, 0), radius, normalMap);
    //     this.meshes.push(topFace);

    //     let bottomFace = createSquare(faceResolution, new three.Vector3(0, -1, 0), radius, normalMap);
    //     this.meshes.push(bottomFace);

    //     let frontFace = createSquare(faceResolution, new three.Vector3(0, 0, 1), radius, normalMap);
    //     this.meshes.push(frontFace);

    //     let backFace = createSquare(faceResolution, new three.Vector3(0, 0, -1), radius, normalMap);
    //     this.meshes.push(backFace);

    //     let leftFace = createSquare(faceResolution, new three.Vector3(1, 0, 0), radius, normalMap);
    //     this.meshes.push(leftFace);
        
    //     let rightFace = createSquare(faceResolution, new three.Vector3(-1, 0, 0), radius, normalMap);
    //     this.meshes.push(rightFace);


    //     for (let i = 0; i < this.meshes.length; i++)
    //         scene.add(this.meshes[i]);
    // }
}