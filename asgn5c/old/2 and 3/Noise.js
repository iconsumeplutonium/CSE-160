//adapted from
//https://github.com/SebLague/Procedural-Landmass-Generation/blob/master/Proc%20Gen%20E03/Assets/Scripts/Noise.cs

export function FBM(scale, octaves, persistence, lacunarity, offset) {
    if (scale <= 0)
        scale = 0.001;

    let amplitude = 1;
    let frequency = 1;
    let noiseHeight = 0;

    for (let i = 0; i < octaves; i++) {
        let sampleX = (offset.x) / scale * frequency;
        let sampleY = (offset.y) / scale * frequency;

        let perlinVal = noise.simplex2(sampleX + 0.1, sampleY + 0.1);
        //perlinVal = (perlinVal + 1) / 2; //to bring it to the range 0 to 1
        noiseHeight += perlinVal * amplitude;

        amplitude *= persistence;
        frequency *= lacunarity;
    }
    
    return (noiseHeight + 1) / 2;

}