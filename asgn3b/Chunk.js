class Chunk {
    constructor(width, height, offset) {
        this.chunkWidth = width;
        this.chunkHeight = height;
        this.enabled = false;
        this.offset = offset;

        this.noiseMap = Noise.GenerateNoiseMap(this.chunkWidth, this.chunkWidth, 100, 8, 0.5, 2, offset);
        this.voxelMap = [];
        for (let i = 0; i < 16; i++) {
            this.voxelMap[i] = [];
        }

        this.playerCreatedBlocks = [];

        this.blockWorldPosOffset = new Vector3([this.offset.x * this.chunkWidth, this.offset.y * this.chunkHeight, 0]);
        for (let x = 0; x < this.chunkWidth; x++) {
            for (let y = 0; y < this.chunkHeight; y++) {
    
                let z = this.convertToWorldHeight(this.noiseMap[x][y]);
                let block = new Cube("grass_block");
                block.matrix.setTranslate(this.blockWorldPosOffset.x + x, z - 1, this.blockWorldPosOffset.y + y);
                block.coordinatesInChunk = new Vector3([x, z - 1, y]);
                this.voxelMap[x][y] = block;

                //Generate stone layer
                //Only generate stone underneath grass blocks who are more than one block above their neighbors to fill in gaps
                //this doesnt take into account two block jumps on chunk boundaries
                let neighbors = this.getNeighbors(x, y);
                for (const n of neighbors) {
                    if (n.x >= 16 || n.y >= 16)
                        continue;
                    let heightAtNeighbor = this.convertToWorldHeight(this.noiseMap[n.x][n.y]);
                    if (z - heightAtNeighbor > 1) {
                        let block = new Cube("stone_block");
                        block.matrix.setTranslate(this.blockWorldPosOffset.x + x, z - 2, this.blockWorldPosOffset.y + y);
                        block.coordinatesInChunk = new Vector3([x, z - 2, y]);
                        this.voxelMap.push(block);
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
        for (let i = 0; i < this.chunkWidth; i++) {
            for (let j = 0; j < this.chunkHeight; j++) {
                if (this.voxelMap[i][j] != null)
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
        if (this.voxelMap[x][z].coordinatesInChunk.y == y) {
            this.voxelMap[x][z].texture = GetUVsForTexture(blockType);
            return;
        }
        
        //case 2: block already exists, located in playerCreatedBlocks
        for (let i = 0; i < this.playerCreatedBlocks.length; i++) {
            if (this.playerCreatedBlocks[i].coordinatesInChunk.equals([x, y, z])) {
                this.playerCreatedBlocks[i].texture = GetUVsForTexture(blockType);
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

    }
}