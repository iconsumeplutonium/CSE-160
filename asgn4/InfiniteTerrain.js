//adapated from here https://github.com/SebLague/Procedural-Landmass-Generation/blob/master/Proc%20Gen%20E07/Assets/Scripts/EndlessTerrain.cs
let renderDistance = 2;
let terrainChunkDict = new Map();


function updateVisibleChunks() {
    let currentChunkCoord = convertWorldCoordToChunkCoord(camera.eye);

    for (let y = -renderDistance; y <= renderDistance; y++) {
        for (let x = -renderDistance; x <= renderDistance; x++) {
            let viewedChunkCoord = new Vector3([currentChunkCoord.x + x, currentChunkCoord.y + y, 0]);

            if (dictContains(viewedChunkCoord)) {
                //console.log("contains it");
                terrainChunkDict.get(viewedChunkCoord.toString()).displayChunk();
            } else {
                let chunk = new Chunk(chunkSize, chunkSize, viewedChunkCoord);
                terrainChunkDict.set(chunk.offset.toString(), chunk);
                //console.log("made new one");
            }
        }
    }
}

//dictionary access functions
function dictContains(vector) {
    return terrainChunkDict.get(vector.toString()) != undefined;
}