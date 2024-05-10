class Chunk {
    constructor(width, height, offset) {
        this.chunkWidth = width;
        this.chuckHeight = height;
        this.enabled = false;
        this.offset = offset;

        this.noiseMap = Noise.GenerateNoiseMap(this.chunkWidth, this.chunkWidth, 100, 8, 0.5, 2, offset);
        this.voxelMap = [];

        let blockWorldPosOffset = new Vector3([this.offset.x * this.chunkWidth, this.offset.y * this.chuckHeight, 0]);
        for (let x = 0; x < this.chunkWidth; x++) {
            for (let y = 0; y < this.chuckHeight; y++) {
    
                let z = this.convertToWorldHeight(this.noiseMap[x][y]);
                let block = new Cube("grass_block");
                block.matrix.setTranslate(blockWorldPosOffset.x + x, z - 1, blockWorldPosOffset.y + y);
                this.voxelMap.push(block);

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
                        block.matrix.setTranslate(blockWorldPosOffset.x + x, z - 2, blockWorldPosOffset.y + y);
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
        for (let i = 0; i < this.voxelMap.length; i++) {
            this.voxelMap[i].renderFast();
        }
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

                if (neighborCandidate.y < 0 || neighborCandidate.y >= this.chuckHeight)
                    continue;

                validNeighbors.push(neighborCandidate);
            }
        }

        return validNeighbors;
    }
}