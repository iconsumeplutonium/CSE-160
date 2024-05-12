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

        //im also pushing the subsurface stone layer into here because i cant be bothered making a new array for it
        this.playerCreatedBlocks = [];

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
    }

    convertToWorldHeight(value) {
        return Math.floor(value.toFixed(2) * 50);
    }

    displayChunk() {
        // if (!this.enabled)
        //     return;

        for (let i = 0; i < this.chunkWidth; i++) {
            for (let j = 0; j < this.chunkHeight; j++) {
                if (!this.voxelMap[i][j].isAir)
                    this.voxelMap[i][j].renderFast();
            }
        }

        for (let i = 0; i < this.playerCreatedBlocks.length; i++)
            this.playerCreatedBlocks[i].renderFast();
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
        console.log(x, z);
        if (this.voxelMap[x] && this.voxelMap[x][z] && this.voxelMap[x][z].coordinatesInChunk.y == y) {
            console.log("here")
            this.voxelMap[x][z].isAir = true;
            return;
        }
        
        //check playerCreatedBlocks
        for (let i = 0; i < this.playerCreatedBlocks.length; i++) {
            if (this.playerCreatedBlocks[i].coordinatesInChunk.equals([x, y, z])) {
                this.playerCreatedBlocks.splice(i, 1);
                return;
            }
        }
    }

    updateChunkVisibility() {
        // let chunkCenter = new Vector3([(this.offset.x * this.chunkWidth) + this.chunkWidth / 2, (this.offset.y * this.chunkHeight) + this.chunkWidth / 2, 0]);
        // let distToCamera = chunkCenter.sub(camera.eye).magnitude();

        // //let enableStatusPreviously = this.enabled;
        // this.enabled = distToCamera <= maxViewDist;

        // if (this.enabled)
            this.enabled = true;
            this.displayChunk();
    }
}