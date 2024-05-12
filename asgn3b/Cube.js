class Cube {
    constructor(blockType) {
        this.color = null;
        this.matrix = new Matrix4();
        this.coordinatesInChunk = null;
        this.isAir = false; //if true, this block is skipped in chunk rendering (represents a deleted block)

        let cubeSize = 1;
        this.coordinates = [
            [-(cubeSize / 2), -(cubeSize / 2), -(cubeSize / 2)],
            [-(cubeSize / 2), -(cubeSize / 2), (cubeSize / 2)],
            [-(cubeSize / 2), (cubeSize / 2), -(cubeSize / 2)],
            [-(cubeSize / 2), (cubeSize / 2), (cubeSize / 2)],
            [(cubeSize / 2), -(cubeSize / 2), -(cubeSize / 2)],
            [(cubeSize / 2), -(cubeSize / 2), (cubeSize / 2)],
            [(cubeSize / 2), (cubeSize / 2), -(cubeSize / 2)],
            [(cubeSize / 2), (cubeSize / 2), (cubeSize / 2)],
        ];


        this.texture = GetUVsForTexture(blockType);
        this.useColor = false;

        this.allVerts = [];

        this.allVerts = this.allVerts.concat(this.addTri(0, 2, 4));
        this.allVerts = this.allVerts.concat(this.addTri(4, 2, 6));
        
        this.allVerts = this.allVerts.concat(this.addTri(4, 6, 5));
        this.allVerts = this.allVerts.concat(this.addTri(5, 6, 7));

        this.allVerts = this.allVerts.concat(this.addTri(5, 7, 1));
        this.allVerts = this.allVerts.concat(this.addTri(1, 7, 3));

        this.allVerts = this.allVerts.concat(this.addTri(1, 3, 0));
        this.allVerts = this.allVerts.concat(this.addTri(0, 3, 2));

        this.allVerts = this.allVerts.concat(this.addTri(2, 3, 6));
        this.allVerts = this.allVerts.concat(this.addTri(6, 3, 7));

        this.allVerts = this.allVerts.concat(this.addTri(1, 0, 5));
        this.allVerts = this.allVerts.concat(this.addTri(5, 0, 4));
    }

    //poor man's C macro
    tri(a, b, c) {
        drawTriangles(this.coordinates[a].concat(this.coordinates[b], this.coordinates[c]));
    }

    triUV(a, b, c, uv) {
        drawTrianglesUV(this.coordinates[a].concat(this.coordinates[b], this.coordinates[c]), uv);
    }

    addTri(a, b, c) {
        let l = [];
        l = l.concat(this.coordinates[a]);
        l = l.concat(this.coordinates[b]);
        l = l.concat(this.coordinates[c]);

        return l;
    }    

    render() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let bottomTriUV = [0,0,  0,1,  1,0];
        let topTriUV = [1,0,  0,1,  1,1];

        //front
        if (this.useColor) {
            gl.uniform4fv(u_FragColor, this.color);
            gl.uniform1i(textureID, -2);
        } else
            gl.uniform1i(textureID, this.textureArray[0]);
        this.triUV(0, 2, 4, bottomTriUV);
        this.triUV(4, 2, 6, topTriUV);

        //right
        if (!this.useColor)
            gl.uniform1i(textureID, this.textureArray[1]);
        this.triUV(4, 6, 5, bottomTriUV);
        this.triUV(5, 6, 7, topTriUV);

        //back
        if (!this.useColor)
            gl.uniform1i(textureID, this.textureArray[2]);
        this.triUV(5, 7, 1, bottomTriUV);
        this.triUV(1, 7, 3, topTriUV);

        //left
        if (!this.useColor)
            gl.uniform1i(textureID, this.textureArray[3]);
        this.triUV(1, 3, 0, bottomTriUV);
        this.triUV(0, 3, 2, topTriUV);

        //top
        if (!this.useColor)
            gl.uniform1i(textureID, this.textureArray[4]);
        this.triUV(2, 3, 6, bottomTriUV);
        this.triUV(6, 3, 7, topTriUV);

        //bottom
        if (!this.useColor)
            gl.uniform1i(textureID, this.textureArray[5]);
        this.triUV(1, 0, 5, bottomTriUV);
        this.triUV(5, 0, 4, topTriUV);
    }
    
    renderFast() {
        if (this.isAir)
            return;

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //drawTrianglesUV_OneBuffer(this.allVerts, this.texture);

        let vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create buffer obj');
            return -1;
        }

        let verticesF32 = new Float32Array(this.allVerts);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verticesF32, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);


        let uvBuffer = gl.createBuffer();
        if (!uvBuffer) {
            console.log('failed to make uv buffer obj');
            return -1;
        }
        let uvsF32 = new Float32Array(this.texture);
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, uvsF32, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);


        gl.drawArrays(gl.TRIANGLES, 0, this.allVerts.length / 3);

        //without this, js gc would cause massive stutters of up to 2 seconds
        gl.deleteBuffer(vertexBuffer);
        gl.deleteBuffer(uvBuffer);
    }
}
