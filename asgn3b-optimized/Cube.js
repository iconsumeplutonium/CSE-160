class Cube {
    constructor(blockType) {
        this.matrix = new Matrix4();
        this.coordinatesInChunk = null;
        this.isAir = false; //if true, this block is skipped in chunk rendering (represents a deleted block)
        this.isFoliage = false; //if true, this block is skipped in rendering if disable foliage option is selected

        const cubeSize = 1;
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

        this.texture = new Float32Array(GetUVsForTexture(blockType));
        this.verticesF32 = new Float32Array([].concat(
            this.addTri(0, 2, 4),
            this.addTri(4, 2, 6),
            this.addTri(4, 6, 5),
            this.addTri(5, 6, 7),
            this.addTri(5, 7, 1),
            this.addTri(1, 7, 3),
            this.addTri(1, 3, 0),
            this.addTri(0, 3, 2),
            this.addTri(2, 3, 6),
            this.addTri(6, 3, 7),
            this.addTri(1, 0, 5),
            this.addTri(5, 0, 4)
        ));

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        this.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);
    }

    //poor man's C macro
    addTri(a, b, c) {
        return [].concat(
            this.coordinates[a],
            this.coordinates[b],
            this.coordinates[c]
        );
    }
    
    renderFast() {
        if (this.isAir) return;

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.verticesF32, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.texture, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);

        gl.drawArrays(gl.TRIANGLES, 0, this.verticesF32.length / 3);
    }
}
