import * as three from 'three';

//https://threejs.org/docs/#api/en/core/BufferGeometry
export function createSquare(position, size, resolution) {
    const geometry = new three.BufferGeometry();

    let newCorner = new three.Vector3(-size / 2, -size / 2, -size / 2);
    
    // let size = 100;
    // let resolution = 10;
    let vertices = [];
    
    const stepSize = size / resolution;
    let k = newCorner.y;
    for (let i = newCorner.x; i < newCorner.x + size; i += stepSize) {
        for (let j = newCorner.z; j < newCorner.z + size; j += stepSize) {
            
            vertices.push(i, k, j);
            vertices.push(i + stepSize, k, j);
            vertices.push(i, k, j + stepSize);

            vertices.push(i + stepSize, k, j);
            vertices.push(i + stepSize, k, j + stepSize);
            vertices.push(i, k, j + stepSize);
        }
    }
    

    let spheredVertices = [];
    const radius = 1;
    for (let i = 0; i < vertices.length; i += 3) {
        let v = new three.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]).normalize().multiplyScalar(radius);
        spheredVertices.push(v.x, v.y, v.z);
    }
    
    geometry.setAttribute('position', new three.BufferAttribute( new Float32Array(spheredVertices), 3));
    const material = new three.MeshPhongMaterial({color: Math.random() * 0xFFFFFF, wireframe: false});
    const mesh = new three.Mesh( geometry, material );

    return mesh;
    //scene.add(mesh);
}

export function createCubeFace(position, size, numChunks, chunkSize, chunkResolution, scene) {
    //centered at position
    const faceSize = size / numChunks;
    const halfWidth = size / 2;

    for (let i = 0; i < size; i += faceSize) {
        for (let j = 0; j < size; j += faceSize) {
            let pos = new three.Vector3(position.x + i, 0, position.z + j);
            createSquare(pos, scene, chunkSize, chunkResolution);
        }
    }
}

export class CubeSphere {
    constructor(position, s1, scene) {
        this.meshes = [];
        const faceResolution = 100;
        const size = 1
        
        let topFace = createSquare(position, 1, faceResolution);
        this.meshes.push(topFace);

        let bottomFace = createSquare(position, size, faceResolution);
        bottomFace.rotation.z = Math.PI;
        this.meshes.push(bottomFace);

        let frontFace = createSquare(position, size, faceResolution);
        frontFace.rotation.x = -Math.PI / 2;    
        this.meshes.push(frontFace);

        let backFace = createSquare(position, size, faceResolution);
        backFace.rotation.x = Math.PI / 2;    
        this.meshes.push(backFace);

        let leftFace = createSquare(position, size, faceResolution);
        leftFace.rotation.z = Math.PI / 2;
        this.meshes.push(leftFace);
        
        let rightFace = createSquare(position, size, faceResolution);
        rightFace.rotation.z = -Math.PI / 2;
        this.meshes.push(rightFace);


        for (let i = 0; i < this.meshes.length; i++)
            scene.add(this.meshes[i]);
    }
}