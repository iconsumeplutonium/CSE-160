import * as three from 'three';
import { createNoise2D, createNoise3D } from './simplex-noise.js';

//https://threejs.org/docs/#api/en/core/BufferGeometry
//adapted from https://github.com/SebLague/Procedural-Planets/blob/master/Procedural%20Planet%20E01/Assets/TerrainFace.cs
export function createSquare(resolution, localUp, radius, normalMap) {
    let axisA = new three.Vector3(localUp.y, localUp.z, localUp.x);
    let axisB = localUp.clone().cross(axisA);

    let vertices = new Float32Array(resolution * resolution * 3);
    let triangles = new Uint32Array((resolution - 1) * (resolution - 1) * 6);
    let triIndex = 0;

    const noiseScale = 1;

    for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
            let i = x + y * resolution;
            let percent = new three.Vector2(x, y).divideScalar(resolution - 1);
            let pointOnUnitCube = localUp.clone().add(axisA.clone().multiplyScalar((percent.x - .5) * 2)).add(axisB.clone().multiplyScalar((percent.y - .5) * 2));

            let pointOnUnitSphere = pointOnUnitCube.normalize();

            
            let height = (Noise.FBM(noiseScale, 16, 0.5, 2, pointOnUnitSphere) + 1) / 2;
            //console.log(height + radius)
            pointOnUnitSphere.multiplyScalar(radius)
            vertices.set([pointOnUnitSphere.x, pointOnUnitSphere.y, pointOnUnitSphere.z], i * 3);

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
    //geometry.computeVertexNormals()
    const material = new three.MeshPhongMaterial({color: 0x00FFFF, wireframe: false});

    
    material.normalMap = normalMap;
    material.normalScale.set(1, 1);
    material.needsUpdate = true;
    const mesh = new three.Mesh(geometry, material);


    return mesh;


    
}


export class CubeSphere {
    constructor(position, s1, scene, normalMap) {
        this.meshes = [];
        const faceResolution = 100;
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