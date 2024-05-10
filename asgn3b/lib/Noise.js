class Noise {
    constructor() {
        //adapted from
        //https://github.com/SebLague/Procedural-Landmass-Generation/blob/master/Proc%20Gen%20E03/Assets/Scripts/Noise.cs
    }

    static GenerateNoiseMap(mapWidth, mapHeight, scale, octaves, persistence, lacunarity, offset) {
        let map = [];
        for (let i = 0; i < mapHeight; i++)
            map.push([]);

        if (scale <= 0)
            scale = 0.001;

        let maxNoiseHeight = -99999;
        let minNoiseHeight = 99999;
        
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                let amplitude = 1;
                let frequency = 1;
                let noiseHeight = 0;

                for (let i = 0; i < octaves; i++) {
                    let sampleX = (x + (offset.x * mapWidth)) / scale * frequency;
                    let sampleY = (y + (offset.y * mapHeight)) / scale * frequency;

                    let perlinVal = perlin.get(sampleX + 0.1, sampleY + 0.1);
                    //perlinVal = (perlinVal + 1) / 2; //to bring it to the range 0 to 1
                    noiseHeight += perlinVal * amplitude;

                    amplitude *= persistence;
                    frequency *= lacunarity;
                }
                
                if (noiseHeight > maxNoiseHeight)
                    maxNoiseHeight = noiseHeight;
                else if (noiseHeight < minNoiseHeight)
                    minNoiseHeight = noiseHeight;

                map[x][y] = noiseHeight;
            }
        }

        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                //map[x][y] = minNoiseHeight * (1 - map[x][y]) + maxNoiseHeight * map[x][y];
                map[x][y] = (map[x][y] + 1) / 2;
            }
        }


        return map;
    }
}