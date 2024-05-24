class Cube {
    constructor(blockType = "dirt_block", color = [0, 0, 1, 1]) {
        this.color = color;
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();

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


        this.normals = [];
        this.normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);  //front
        this.normals.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0);  //right
        this.normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);  //back
        this.normals.push(-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0);  //left
        this.normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);  //top
        this.normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0); //bottom

        this.colors = [];
        for (let i = 0; i < 36; i++)
            this.colors =  this.colors.concat(this.color);

        console.log(this.color);

    }

    addTri(a, b, c) {
        let l = [];
        l = l.concat(this.coordinates[a]);
        l = l.concat(this.coordinates[b]);
        l = l.concat(this.coordinates[c]);

        return l;
    }
    
    renderFast() {
        if (this.isAir)
            return;

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform3fv(a_FragColor, new Float32Array([0, 0, 1, 1]));

        this.normalMatrix.setInverseOf(this.matrix);
        this.normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

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


        // let uvBuffer = gl.createBuffer();
        // if (!uvBuffer) {
        //     console.log('failed to make uv buffer obj');
        //     return -1;
        // }
        // let uvsF32 = new Float32Array(this.texture);
        // gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, uvsF32, gl.DYNAMIC_DRAW);
        // gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(a_UV);


        let normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);


        // let colorBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.DYNAMIC_DRAW);
        // gl.vertexAttribPointer(a_FragColor, 3, gl.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(a_FragColor);




        gl.drawArrays(gl.TRIANGLES, 0, this.allVerts.length / 3);

        gl.deleteBuffer(vertexBuffer);
        //gl.deleteBuffer(uvBuffer);
        gl.deleteBuffer(normalBuffer);
    }
}
