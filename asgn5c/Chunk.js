import * as three from 'three';
import {FBM} from './Noise.js';

export class Chunk {
    constructor(offset, scene, chunkScale) {
        this.offset = offset;
        this.worldSpaceCoord = new three.Vector2(this.offset * 3, this.offset * 3);
        this.height = FBM(1, 3, 0.5, 2, offset);
        //this.height = this.bias2(this.height)

        this.chunkScale = chunkScale;
        const spacingScale = 3;
        const geometry = new three.BoxGeometry(0.5 * this.chunkScale, this.height * this.chunkScale * 5, 0.5 * this.chunkScale);
        const material = new three.MeshPhongMaterial({
            color: 0xFFFFFF
        });

        this.mesh = new three.Mesh(geometry, material);
        this.mesh.position.x = this.offset.x * this.chunkScale + 0.125;
        this.mesh.position.y = (this.height * this.chunkScale * 5 - 1) / 2;
        this.mesh.position.z = this.offset.y * this.chunkScale + 0.125;
        this.setActive(true);

        scene.add(this.mesh);
    }

    setActive(b) {
        this.mesh.visible = b;
    }

    bias(x) {
        const bias = 0.55;
        const k = Math.pow(1 - bias, 3);
    
        return (x * k) / (x * k - x + 1);
    }

    bias2(x) {
        return Math.exp(4 * (x - 1.1));
    }
    

   
    
}