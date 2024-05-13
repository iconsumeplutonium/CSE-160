class Chunk {
    constructor(width, height, offset) {
        this.chunkWidth = width;
        this.chunkHeight = height;
        this.enabled = false;
        this.offset = offset;

        this.noiseMap = Noise.GenerateNoiseMap(this.chunkWidth, this.chunkWidth, 100, 8, 0.5, 2, offset);
        this.biomeMap = Noise.GenerateNoiseMap(this.chunkWidth, this.chunkHeight, 200, 8, 0.5, 2, new Vector3([this.offset.x + 100, this.offset.y + 100, 0]));
        this.voxelMap = [];
        for (let i = 0; i < this.chunkWidth; i++) {
            this.voxelMap[i] = [];
        }

        let partialHash = (worldSeed * 569 + this.offset.x) % Number.MAX_SAFE_INTEGER;
        this.chunkSeed = (partialHash * 1499 + this.offset.y) % Number.MAX_SAFE_INTEGER;

        //im also pushing the subsurface stone layer + tree blocks into here because i cant be bothered making a new array for it
        this.playerCreatedBlocks = [];
        //this.chunkTreeBlocks = [];

        this.blockWorldPosOffset = new Vector3([this.offset.x * this.chunkWidth, this.offset.y * this.chunkHeight, 0]);
        for (let x = 0; x < this.chunkWidth; x++) {
            for (let y = 0; y < this.chunkHeight; y++) {
    
                let z = this.convertToWorldHeight(this.noiseMap[x][y]);
                let block = new Cube((this.biomeMap[x][y] >= 0.45) ? "grass_block" : "sand");
                block.matrix.setTranslate(this.blockWorldPosOffset.x + x, z - 1, this.blockWorldPosOffset.y + y);
                block.coordinatesInChunk = new Vector3([x, z - 1, y]);
                this.voxelMap[x][y] = block;

                //Generate stone layer
                //Only generate stone underneath grass blocks who are more than one block above their neighbors to fill in gaps
                //this doesnt take into account two block jumps on chunk boundaries, but idc
                let neighbors = this.getNeighbors(x, y);
                for (const n of neighbors) {
                    if (n.x >= this.chunkWidth || n.y >= this.chunkHeight)
                        continue;
                    let heightAtNeighbor = this.convertToWorldHeight(this.noiseMap[n.x][n.y]);
                    if (z - heightAtNeighbor > 1) {
                        let block = new Cube("stone_block");
                        block.matrix.setTranslate(this.blockWorldPosOffset.x + x, z - 2, this.blockWorldPosOffset.y + y);
                        block.coordinatesInChunk = new Vector3([x, z - 2, y]);
                        this.playerCreatedBlocks.push(block);
                        break;
                    }
                }

                // let stoneBlock = new Cube("stone_block");
                // stoneBlock.matrix.setTranslate(blockWorldPosOffset.x + x, z - 2, blockWorldPosOffset.y + y);
                // this.voxelMap.push(stoneBlock);

            }
        }

        this.generateTrees();
    }

    convertToWorldHeight(value) {
        return Math.floor(value.toFixed(2) * 50);
    }

    displayChunk() {
        // let bottomLeft = new Vector3(this.blockWorldPosOffset);
        // let topLeft =     new Vector3([bottomLeft.x,                    camera.forward,  bottomLeft.z + this.chunkHeight]);
        // let bottomRight = new Vector3([bottomLeft.x + this.chunkWidth,  camera.forward,  bottomLeft.z                   ]);
        // let topRight =    new Vector3([bottomLeft.x + this.chunkWidth,  camera.forward,  bottomLeft.z = this.chunkHeight]);

        // if (!(camera.pointIsVisible(bottomLeft) && camera.pointIsVisible(bottomRight) && camera.pointIsVisible(topLeft) && camera.pointIsVisible(topRight)))
        //     return;

        for (let i = 0; i < this.chunkWidth; i++) {
            for (let j = 0; j < this.chunkHeight; j++) {
                if (!this.voxelMap[i][j].isAir) {
                    //let worldSpaceCoord = new Vector3([this.blockWorldPosOffset.x + i, this.voxelMap[i][j].coordinatesInChunk.y, this.blockWorldPosOffset.y + j]);

                    //if (camera.pointIsVisible(worldSpaceCoord))
                        this.voxelMap[i][j].renderFast();
                }
            }
        }

        for (let i = 0; i < this.playerCreatedBlocks.length; i++) {
            if (this.playerCreatedBlocks[i].isFoliage && disableFoliageCheckbox.checked)
                continue;

            this.playerCreatedBlocks[i].renderFast();
        }
        // for (let i = 0; i < this.chunkTreeBlocks.length; i++) {
        //     //let worldSpaceCoord = new Vector3([this.chunkTreeBlocks[i].coordinatesInChunk.x + this.blockWorldPosOffset.x, this.chunkTreeBlocks[i].coordinatesInChunk.y, this.chunkTreeBlocks[i].coordinatesInChunk.z + this.blockWorldPosOffset.y]);

        //     //if (camera.pointIsVisible(worldSpaceCoord))
        //         this.chunkTreeBlocks[i].renderFast();
        // }
    }

    //returns a list of the neighbors of a coordinate in a heightmap
    getNeighbors(x, y) {
        let validNeighbors = [];

        for (let i = -1; i <= 1; i++) {
            if (i == 0)
                continue;

            for (let j = -1; j <= 1; j++) {
                if (j == 0)
                    continue;

                let neighborCandidate = new Vector3([x + i, y + j, 0]);
                if (neighborCandidate.x < 0 || neighborCandidate.y >= this.chunkWidth)
                    continue;

                if (neighborCandidate.y < 0 || neighborCandidate.y >= this.chunkHeight)
                    continue;

                validNeighbors.push(neighborCandidate);
            }
        }

        return validNeighbors;
    }

    addOrModifyBlock(x, y, z, blockType) {
        //case 1: block already exists, located in voxelMap
        if (this.voxelMap[x] && this.voxelMap[x][z] && this.voxelMap[x][z].coordinatesInChunk.y == y) {
            
            let c = new Cube(blockType);
            c.matrix.setTranslate(this.blockWorldPosOffset.x + x, y, this.blockWorldPosOffset.y + z);
            c.coordinatesInChunk = new Vector3([x, y, z]);

            this.voxelMap[x][z] = c;
            return;
        }
        
        //case 2: block already exists, located in playerCreatedBlocks
        for (let i = 0; i < this.playerCreatedBlocks.length; i++) {
            if (this.playerCreatedBlocks[i].coordinatesInChunk.equals([x, y, z])) {

                let c = new Cube(blockType);
                c.matrix.setTranslate(this.blockWorldPosOffset.x + x, y, this.blockWorldPosOffset.y + z);
                c.coordinatesInChunk = new Vector3([x, y, z]);

                this.playerCreatedBlocks[i] = c;
                return;
            }
        }
        
        //case 3: block does not exist. create new block and add it to the playerCreatedBlock array
        let block = new Cube(blockType);
        block.matrix.setTranslate(this.blockWorldPosOffset.x + x, y, this.blockWorldPosOffset.y + z);
        block.coordinatesInChunk = new Vector3([x, y, z]);
        this.playerCreatedBlocks.push(block);
    }

    deleteBlock(x, y, z) {
        //check voxel map
        console.log("voxel map:", this.voxelMap[x][z].coordinatesInChunk.toString())
        console.log(x, z);
        if (this.voxelMap[x] && this.voxelMap[x][z] && this.voxelMap[x][z].coordinatesInChunk.y == y) {
            this.voxelMap[x][z].isAir = true;
            return;
        }

        console.log(x, y, z);
        
        //check playerCreatedBlocks
        for (let i = 0; i < this.playerCreatedBlocks.length; i++) {
            console.log(this.playerCreatedBlocks[i].coordinatesInChunk.toString());
            if (this.playerCreatedBlocks[i].coordinatesInChunk.equals([x, y, z])) {
                this.playerCreatedBlocks.splice(i, 1);
                return;
            }
        }

        //check chunk foliage array
        // for (let i = 0; i < this.chunkTreeBlocks.length; i++) {
        //     console.log(this.chunkTreeBlocks[i].coordinatesInChunk.toString());
        //     if (this.chunkTreeBlocks[i].coordinatesInChunk.equals([x, y, z])) {
        //         this.chunkTreeBlocks.splice(i, 1);
        //         return;
        //     }
        // }
    }

    generateTrees() {
        const prng = this.sfc32(this.chunkSeed, this.chunkSeed, this.chunkSeed, this.chunkSeed);
        //burn first 10 random numbers, because this algorithm seems to give almost similar starting numbers
        for (let i = 0; i <= 10; i++)
            prng();

        let numTreesInChunk = Math.floor(prng() * 2);

        for (let i = 0; i < numTreesInChunk; i++) {
            let randX = Math.floor(prng() * (this.chunkWidth - 1));
            let randY = Math.floor(prng() * (this.chunkHeight - 1));
            let height = this.convertToWorldHeight(this.noiseMap[randX][randY]);
            let treeBaseCoord = new Vector3([this.blockWorldPosOffset.x + randX, height, this.blockWorldPosOffset.y + randY]);
            let localBaseCoord = new Vector3([randX, height, randY]);

            if (this.biomeMap[randX][randY] >= 0.45) { //plains, make normal tree
                //trunk
                let c = new Cube("oak_log");
                c.matrix.setTranslate(treeBaseCoord.x, treeBaseCoord.y, treeBaseCoord.z);
                c.coordinatesInChunk = new Vector3(localBaseCoord);
                c.isFoliage = true;
                this.playerCreatedBlocks.push(c);

                c = new Cube("oak_log");
                c.matrix.setTranslate(treeBaseCoord.x, treeBaseCoord.y + 1, treeBaseCoord.z);
                c.coordinatesInChunk = new Vector3([localBaseCoord.x, localBaseCoord.y + 1, localBaseCoord.z]);
                c.isFoliage = true;
                this.playerCreatedBlocks.push(c);

                //3 by 3 layer of leaves
                //the center block will be covered, so we can skip it
                for (let j = -1; j <= 1; j++) {
                    for (let k = -1; k <= 1; k++) {
                        if (j == 0 && k == 0)
                            continue;

                        let v = new Vector3([treeBaseCoord.x + j, treeBaseCoord.y + 2, treeBaseCoord.z + k]);
                        let w = new Vector3([localBaseCoord.x + j, localBaseCoord.y + 2, localBaseCoord.z + k]);
                        c = new Cube("oak_leaves");
                        c.matrix.setTranslate(v.x, v.y, v.z);
                        c.coordinatesInChunk = new Vector3(w);
                        c.isFoliage = true;
                        this.playerCreatedBlocks.push(c);
                    }
                }

                //plus-shaped layer of leaves
                for (let j = -1; j <= 1; j++) {
                    for (let k = -1; k <= 1; k++) {
                        if (Math.abs(j) == 1 && Math.abs(k) == 1)
                            continue;

                        let v = new Vector3([treeBaseCoord.x + j, treeBaseCoord.y + 3, treeBaseCoord.z + k]);
                        let w = new Vector3([localBaseCoord.x + j, localBaseCoord.y + 3, localBaseCoord.z + k]);
                        c = new Cube("oak_leaves");
                        c.matrix.setTranslate(v.x, v.y, v.z);
                        c.coordinatesInChunk = new Vector3(w);
                        c.isFoliage = true;
                        this.playerCreatedBlocks.push(c);
                    }
                }
            } else { //desert, make cactus

                let cactusHeight = Math.round(prng() * 3);
                for (let j = 0; j <= cactusHeight; j++) {
                    let v = new Vector3([treeBaseCoord.x, treeBaseCoord.y + j, treeBaseCoord.z]);
                    let w = new Vector3([localBaseCoord.x, localBaseCoord.y + j, localBaseCoord.z]);
                    let c = new Cube("cactus");
                    c.matrix.setTranslate(v.x, v.y, v.z);
                    c.coordinatesInChunk = new Vector3(w);
                    c.isFoliage = true;
                    this.playerCreatedBlocks.push(c);
                }
            }
        }
    }

    //from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
    sfc32(a, b, c, d) {
        return function() {
          a |= 0; b |= 0; c |= 0; d |= 0;
          let t = (a + b | 0) + d | 0;
          d = d + 1 | 0;
          a = b ^ b >>> 9;
          b = c + (c << 3) | 0;
          c = (c << 21 | c >>> 11);
          c = c + t | 0;
          return (t >>> 0) / 4294967296;
        }
      }
}