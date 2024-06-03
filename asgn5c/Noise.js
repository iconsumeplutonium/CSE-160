// //adapted from
// //https://github.com/SebLague/Procedural-Landmass-Generation/blob/master/Proc%20Gen%20E03/Assets/Scripts/Noise.cs
// import { createNoise3D } from "./simplex-noise.js";

// //export class Noise {
//     //static GenerateNoiseMap(mapWidth, mapHeight, scale, octaves, persistence, lacunarity/*, offset*/) {
//     export function FBM(scale, octaves, persistence, lacunarity, position) {
        
//         if (scale <= 0)
//             scale = 0.001;

//         const noise3D = createNoise3D();
       
//         let amplitude = 1;
//         let frequency = 1;
//         let noiseHeight = 0;

//         for (let i = 0; i < octaves; i++) {
//             let sampleX = (position.x) / scale * frequency;
//             let sampleY = (position.y) / scale * frequency;
//             let sampleZ = (position.z) / scale * frequency;

//             //let perlinVal = perlin.get(sampleX + 0.1, sampleY + 0.1);
//             let perlinVal = noise.perlin3(sampleX, sampleY, sampleZ);
//             //let perlinVal = noise3D(sampleX, sampleY, sampleZ);

//             noiseHeight += perlinVal * amplitude;

//             amplitude *= persistence;
//             frequency *= lacunarity;
//         }
        



//         return noiseHeight;
//     }
// //}
import { createNoise3D } from "./simplex-noise.js";

//adapted from
//https://github.com/SebLague/Procedural-Landmass-Generation/blob/master/Proc%20Gen%20E03/Assets/Scripts/Noise.cs
//extended to work in 3D
export class Noise {
    static GenerateNoiseMap(mapWidth, mapHeight, mapDepth, scale, octaves, persistence, lacunarity, offset) {
        let map = [];
        for (let i = 0; i < mapHeight; i++) {
            map.push([]);
            for (let j = 0; j < mapWidth; j++) {
                map[i].push([]);
                for (let k = 0; k < mapDepth; k++) {
                    map[i][j].push(0);
                }
            }
        }


        if (scale <= 0)
            scale = 0.001;

        let maxNoiseHeight = -99999;
        let minNoiseHeight = 99999;

        const epsilon = 0.01;

        for (let z = 0; z < mapDepth; z++) {
            for (let y = 0; y < mapHeight; y++) {
                for (let x = 0; x < mapWidth; x++) {
                    let amplitude = 1;
                    let frequency = 1;
                    let noiseHeight = 0;

                    for (let i = 0; i < octaves; i++) {
                        let sampleX = (x + (offset.x * mapWidth)) / scale * frequency;
                        let sampleY = (y + (offset.y * mapHeight)) / scale * frequency;
                        let sampleZ = (z + (offset.z * mapDepth)) / scale * frequency;

                        let perlinVal = noise.simplex3(sampleX + epsilon, sampleY + epsilon, sampleZ + epsilon);
                        //perlinVal = (perlinVal + 1) / 2; //to bring it to the range 0 to 1
                        noiseHeight += perlinVal * amplitude;

                        amplitude *= persistence;
                        frequency *= lacunarity;
                    }
                    
                    if (noiseHeight > maxNoiseHeight)
                        maxNoiseHeight = noiseHeight;
                    else if (noiseHeight < minNoiseHeight)
                        minNoiseHeight = noiseHeight;

                    map[x][y][z] = noiseHeight;
                }
            }
        }

        
        for (let z = 0; z < mapDepth; z++) {
            for (let y = 0; y < mapHeight; y++) {
                for (let x = 0; x < mapWidth; x++) {
                    map[x][y][z] = (map[x][y][z] + 1) / 2;
                }
            }
        }

        return map;
    }
}