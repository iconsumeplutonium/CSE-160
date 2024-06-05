import {Chunk} from './Chunk.js';
import * as three from 'three';

//adapated from here https://github.com/SebLague/Procedural-Landmass-Generation/blob/master/Proc%20Gen%20E07/Assets/Scripts/EndlessTerrain.cs
let renderDistance = 5;
let terrainChunkDict = new Map();

let chunksVisibleLastFrame = [];
let positionLastFrame = new three.Vector2(0, 0);
const chunkScale = 10;

export function updateVisibleChunks(playerPos, scene) {
    let currentChunkCoord = new three.Vector2(Math.round(playerPos.x / chunkScale), Math.round(playerPos.y / chunkScale));

    //if player hasnt moved, don't bother with the rest of the function
    if (positionLastFrame.equals(currentChunkCoord)) {
        return;
    }

    for (let i = 0; i < chunksVisibleLastFrame.length; i++)
        chunksVisibleLastFrame[i].setActive(false);
    chunksVisibleLastFrame = []

    for (let y = -renderDistance; y <= renderDistance; y++) {
        for (let x = -renderDistance; x <= renderDistance; x++) {
            let viewedChunkCoord = new three.Vector2(currentChunkCoord.x + x, currentChunkCoord.y + y);
            
            let chunk;
            if (dictContains(viewedChunkCoord)) {
                //console.log("contains it");
                chunk = terrainChunkDict.get(vec2string(viewedChunkCoord));
                //chunk.setActive(true);
            } else {
                chunk = new Chunk(viewedChunkCoord, scene, chunkScale);
                terrainChunkDict.set(vec2string(chunk.offset), chunk);
            }

            chunksVisibleLastFrame.push(chunk);
        }
    }

    positionLastFrame = currentChunkCoord;
}

//dictionary access functions
function dictContains(vector) {
    return terrainChunkDict.get(vector.toString()) != undefined;
}

function vec2string(vec) {
    return `${vec.x},${vec.y}`;
}

function convertWorldCoordToChunkCoord(coordinate, chunkScale) {
    //return new Vector3([Math.floor((camera.at.x - chunkScale / 2) /  chunkScale), Math.floor((camera.at.z - chunkScale / 2) / chunkScale), 0]);
    return new three.Vector2(Math.floor((coordinate.x / chunkScale)), Math.floor((coordinate.z / chunkScale)));
}


