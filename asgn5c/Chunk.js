import * as three from 'three';
import * as LookupTable from './LookupTable.js';
import * as Noise from './Noise.js';

export class Chunk {
    constructor(chunkDimensions, chunkOffset, scene, surfaceLevel) {
        this.dimensions = chunkDimensions.clone();
        this.offset = chunkOffset.clone();
        this.worldSpaceCoords = new three.Vector3(this.dimensions.x * this.offset.x, this.dimensions.y * this.offset.y, this.dimensions.z * this.offset.z);
        this.surfaceLevel = surfaceLevel;

        //console.log(this.dimensions, this.offset, this.worldSpaceCoords);

        this.noiseMap = Noise.Noise.GenerateNoiseMap(this.dimensions.x + 1, this.dimensions.y + 1, this.dimensions.z + 1, 40, 8, 0.5, 2, this.offset);
        //console.log(this.noiseMap)
        this.c = 0xFFFFFF;
        this.useInterpolation = true;
        this.scene = scene;
        this.marchingCubes(scene);
        this.scene.add(this.mesh); 
    }

    getMap() {
        return this.noiseMap;
    }

    setMap(map) {
        //this.scene.remove(this.mesh);
        this.noiseMap = map;
        this.marchingCubes(this.scene);
        this.mesh.geometry.attributes.position.needsUpdate = true;
    }

    marchingCubes(scene) {
        let allVerts = [];
        // for (let i = 0; i <= this.dimensions.x; i++) {
        //     for (let j = 0; j <= this.dimensions.y; j++) {
        //         for (let k = 0; k <= this.dimensions.z; k++) {
        //             //let sample = noise.simplex3(i + offset, j + offset, k + offset)
        //             //let sample = Noise.FBM(40, 8, 0.5, 2, new three.Vector3(i + offset, j + offset, k + offset));
        //             //console.log(i, j, k, sample)
        //             allVerts.push(new three.Vector4(i + this.worldSpaceCoords.x, j + this.worldSpaceCoords.y, k + this.worldSpaceCoords.z, this.noiseMap[i][j][k]));
        //         }
        //     }
        // }

        for (let i = 0; i <= this.dimensions.x; i++) {
            allVerts.push([]);
            for (let j = 0; j <= this.dimensions.y; j++) {
                allVerts[i].push([]);
                for (let k = 0; k <= this.dimensions.z; k++) {
                    allVerts[i][j].push(new three.Vector4(i + this.worldSpaceCoords.x, j + this.worldSpaceCoords.y, k + this.worldSpaceCoords.z, this.noiseMap[i][j][k]));
                }
            }
        }

        // allVerts.push(new three.Vector4(0, 0, 0, 1)); //0
        // allVerts.push(new three.Vector4(1, 0, 0, 1)); //1
        // allVerts.push(new three.Vector4(1, 0, 1, 1)); //2
        // allVerts.push(new three.Vector4(0, 0, 1, 1)); //3
        // allVerts.push(new three.Vector4(0, 1, 0, 1)); //4
        // allVerts.push(new three.Vector4(1, 1, 0, 1)); //5
        // allVerts.push(new three.Vector4(1, 1, 1, 1)); //6
        // allVerts.push(new three.Vector4(0, 1, 1, 1)); //7

        //console.log(allVerts)

        // this.sphere(0, 0, 0, scene)
        // this.sphere(0, 1, 0, scene)
    
        const geometry = new three.BufferGeometry();
        let verts = [];
        for (let i = 0; i < this.dimensions.x; i++) {
            for (let j = 0; j < this.dimensions.y; j++) {
                for (let k = 0; k < this.dimensions.z; k++) {
    
                    let corners = [];
                    corners.push(new three.Vector3(i,     j,     k    ));
                    corners.push(new three.Vector3(i + 1, j,     k    ));
                    corners.push(new three.Vector3(i + 1, j,     k + 1));
                    corners.push(new three.Vector3(i,     j,     k + 1));
                    corners.push(new three.Vector3(i,     j + 1, k    ));
                    corners.push(new three.Vector3(i + 1, j + 1, k    ));
                    corners.push(new three.Vector3(i + 1, j + 1, k + 1));
                    corners.push(new three.Vector3(i,     j + 1, k + 1));

                    //console.log("corners", corners)
    
                    //calculate halfway/interpolated vectors for each edge, based on https://paulbourke.net/geometry/polygonise/polygonise1.gif
                    let edges = [];
                    if (this.useInterpolation) {
                        edges.push(this.interpolatedEdge(allVerts[i    ][j    ][k    ],     allVerts[i + 1][j    ][k    ])); //0
                        edges.push(this.interpolatedEdge(allVerts[i + 1][j    ][k    ],     allVerts[i + 1][j    ][k + 1])); //1
                        edges.push(this.interpolatedEdge(allVerts[i + 1][j    ][k + 1],     allVerts[i    ][j    ][k + 1])); //2
                        edges.push(this.interpolatedEdge(allVerts[i    ][j    ][k + 1],     allVerts[i    ][j    ][k    ])); //3

                        edges.push(this.interpolatedEdge(allVerts[i    ][j + 1][k    ],     allVerts[i + 1][j + 1][k    ])); //4
                        edges.push(this.interpolatedEdge(allVerts[i + 1][j + 1][k    ],     allVerts[i + 1][j + 1][k + 1])); //5
                        edges.push(this.interpolatedEdge(allVerts[i + 1][j + 1][k + 1],     allVerts[i    ][j + 1][k + 1])); //6
                        edges.push(this.interpolatedEdge(allVerts[i    ][j + 1][k + 1],     allVerts[i    ][j + 1][k    ])); //7

                        edges.push(this.interpolatedEdge(allVerts[i    ][j    ][k    ],     allVerts[i    ][j + 1][k    ])); //8
                        edges.push(this.interpolatedEdge(allVerts[i + 1][j    ][k    ],     allVerts[i + 1][j + 1][k    ])); //9
                        edges.push(this.interpolatedEdge(allVerts[i + 1][j    ][k + 1],     allVerts[i + 1][j + 1][k + 1])); //10
                        edges.push(this.interpolatedEdge(allVerts[i    ][j    ][k + 1],     allVerts[i    ][j + 1][k + 1])); //11

                    } else {
                        edges.push(new three.Vector3(i + 0.5, j,       k      )); //0
                        edges.push(new three.Vector3(i + 1,   j,       k + 0.5)); //1
                        edges.push(new three.Vector3(i + 0.5, j,       k + 1  )); //2
                        edges.push(new three.Vector3(i,       j,       k + 0.5)); //3
                        edges.push(new three.Vector3(i + 0.5, j + 1,   k      )); //4
                        edges.push(new three.Vector3(i + 1,   j + 1,   k + 0.5)); //5
                        edges.push(new three.Vector3(i + 0.5, j + 1,   k + 1  )); //6
                        edges.push(new three.Vector3(i,       j + 1,   k + 0.5)); //7
                        edges.push(new three.Vector3(i,       j + 0.5, k      )); //8
                        edges.push(new three.Vector3(i + 1,   j + 0.5, k      )); //9
                        edges.push(new three.Vector3(i + 1,   j + 0.5, k + 1  )); //10
                        edges.push(new three.Vector3(i,       j + 0.5, k + 1  )); //11
                    }

                    
                    let index = 0b0;
                    if (allVerts[corners[0].x][corners[0].y][corners[0].z].w < this.surfaceLevel) { index |= 0b00000001; /*console.log("here0", allVerts[corners[0]]);*/ }
                    if (allVerts[corners[1].x][corners[1].y][corners[1].z].w < this.surfaceLevel) { index |= 0b00000010; /*console.log("here1", allVerts[corners[1]]);*/ }
                    if (allVerts[corners[2].x][corners[2].y][corners[2].z].w < this.surfaceLevel) { index |= 0b00000100; /*console.log("here2", allVerts[corners[2]]);*/ }
                    if (allVerts[corners[3].x][corners[3].y][corners[3].z].w < this.surfaceLevel) { index |= 0b00001000; /*console.log("here3", allVerts[corners[3]]);*/ }
                    if (allVerts[corners[4].x][corners[4].y][corners[4].z].w < this.surfaceLevel) { index |= 0b00010000; /*console.log("here4", allVerts[corners[4]]);*/ }
                    if (allVerts[corners[5].x][corners[5].y][corners[5].z].w < this.surfaceLevel) { index |= 0b00100000; /*console.log("here5", allVerts[corners[5]]);*/ }
                    if (allVerts[corners[6].x][corners[6].y][corners[6].z].w < this.surfaceLevel) { index |= 0b01000000; /*console.log("here6", allVerts[corners[6]]);*/ }
                    if (allVerts[corners[7].x][corners[7].y][corners[7].z].w < this.surfaceLevel) { index |= 0b10000000; /*console.log("here7", allVerts[corners[7]]);*/ }

                    //console.log(index)
    
                    let activeEdgesHex = LookupTable.edgeTable[index];
                    let activeEdges = LookupTable.getActiveEdges(activeEdgesHex);

    
                    let activeTris = LookupTable.triTable[index];
                    for (let x = 0; activeTris[x] != -1; x += 3) {
                        let p1 = edges[activeTris[x]];
                        let p2 = edges[activeTris[x + 1]];
                        let p3 = edges[activeTris[x + 2]];
                        
                        let shift = new three.Vector3(0, 0, 0);
                        if (!this.useInterpolation) //idk why its like this (interpolation doing absolute coord smaybe?)
                            shift = this.worldSpaceCoords.clone();

                        verts.push(
                            p1.x + shift.x, p1.y + shift.y, p1.z + shift.z, 
                            p2.x + shift.x, p2.y + shift.y, p2.z + shift.z, 
                            p3.x + shift.x, p3.y + shift.y, p3.z + shift.z
                        );
                    }
                }
            }
        }

        geometry.setAttribute('position', new three.BufferAttribute(new Float32Array(verts), 3));
    
        //console.log(verts)
        

        // for (let i = 0; i <= this.dimensions.x; i++) {
        //     for (let j = 0; j <= this.dimensions.y; j++) {
        //         for (let k = 0; k <= this.dimensions.z; k++) {
   
        //             // let sample = (noise.simplex3(i + offset, j + offset, k + offset) + 1) / 2;
        //             // if (sample > surfaceLevel)
        //             //     continue;
        //             if (allVerts[i][j][k].w >= this.surfaceLevel)
        //                 continue;
        //             //const col = (sample < surfaceLevel) ? 0x0000FF : 0xFFFFFF;
            
        //             //const geo = new three.BoxGeometry(1, 1, 1);
        //             const geo = new three.SphereGeometry(0.1, 1, 1);
        //             const mat = new three.MeshPhongMaterial({
        //                 color: (allVerts[i][j][k].w >= this.surfaceLevel) ? 0xFFFFFF : 0xFF0000
        //             });
            
        //             const m = new three.Mesh(geo, mat);
        //             m.position.x = i + this.worldSpaceCoords.x;
        //             m.position.y = j + this.worldSpaceCoords.y;
        //             m.position.z = k + this.worldSpaceCoords.z;
        //             scene.add(m);
        //         }
        //     }   
        // }
    
        geometry.computeVertexNormals()
        const material = new three.MeshPhongMaterial({
            color: this.color,
            side: three.DoubleSide
        });
        const mesh = new three.Mesh(geometry, material);
        
        this.mesh = mesh;
        //scene.add(mesh);
    }

    coordToIndex(x, y, z) {
        //return (z * this.dimensions.x * this.dimensions.y) + (y * this.dimensions.x) + x;
        return x + this.dimensions.x * (y + this.dimensions.y * z)

    }

    sphere(x, y, z, scene) {
        const g = new three.SphereGeometry(0.1, 10, 10);
        const m = new three.MeshPhongMaterial({
            color: 0xFFFFFF
        });

        const mesh = new three.Mesh(g, m);
        mesh.position.x = x + this.worldSpaceCoords.x;
        mesh.position.y = y + this.worldSpaceCoords.y;
        mesh.position.z = z + this.worldSpaceCoords.z;

        scene.add(mesh);
    }

    interpolatedEdge(a, b) {
        let p1 = new three.Vector3(a.x, a.y, a.z);
        let p2 = new three.Vector3(b.x, b.y, b.z);

        let v1 = a.w;
        let v2 = b.w
        return p1.add(p2.sub(p1).multiplyScalar(this.surfaceLevel - v1).divideScalar(v2 - v1))
    }
    
}