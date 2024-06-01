//adapted from
//https://github.com/SebLague/Procedural-Landmass-Generation/blob/master/Proc%20Gen%20E03/Assets/Scripts/Noise.cs
class Noise {
    //static GenerateNoiseMap(mapWidth, mapHeight, scale, octaves, persistence, lacunarity/*, offset*/) {
    static FBM(scale, octaves, persistence, lacunarity, position) {
        
        if (scale <= 0)
            scale = 0.001;

       
        let amplitude = 1;
        let frequency = 1;
        let noiseHeight = 0;

        for (let i = 0; i < octaves; i++) {
            let sampleX = (position.x) /*+ (offset.x * mapWidth)) */ / scale * frequency;
            let sampleY = (position.y) /*+ (offset.y * mapHeight))*/ / scale * frequency;
            let sampleZ = (position.z) /*+ (offset.y * mapHeight))*/ / scale * frequency;

            //let perlinVal = perlin.get(sampleX + 0.1, sampleY + 0.1);
            let perlinVal = noise.simplex3(sampleX + 0.1, sampleY + 0.1, sampleZ + 0.1);

            noiseHeight += perlinVal * amplitude;

            amplitude *= persistence;
            frequency *= lacunarity;
        }
        



        return noiseHeight;
    }
}