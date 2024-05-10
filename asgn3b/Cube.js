class Cube {
    constructor(blockType) {
        this.color = null;
        this.matrix = new Matrix4();

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
        this.useColor = false; //if true, uses texture array

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
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // let bottomTriUV = [[0,0],  [0,1],  [1,0]];
        // let topTriUV = [[1,0],  [0,1],  [1,1]];

        // let allVerts = [];

        //front
        // if (this.useColor) {
        //     gl.uniform4fv(u_FragColor, this.color);
        //     gl.uniform1i(textureID, -2);
        // } else
        //     gl.uniform1i(textureID, this.textureArray[0]);
        // allVerts = allVerts.concat(this.addTri(0, 2, 4));
        // allVerts = allVerts.concat(this.addTri(4, 2, 6));
        // //allVerts.push(this.textureArray[0]);

        // //right
        // // if (!this.useColor)
        // //     gl.uniform1i(textureID, this.textureArray[1]);
        // allVerts = allVerts.concat(this.addTri(4, 6, 5));
        // allVerts = allVerts.concat(this.addTri(5, 6, 7));
        // //allVerts.push(this.textureArray[1]);

        // //back
        // // if (!this.useColor)
        // //     gl.uniform1i(textureID, this.textureArray[2]);
        // allVerts = allVerts.concat(this.addTri(5, 7, 1));
        // allVerts = allVerts.concat(this.addTri(1, 7, 3));
        // //allVerts.push(this.textureArray[2]);

        // //left
        // // if (!this.useColor)
        // //     gl.uniform1i(textureID, this.textureArray[3]);
        // allVerts = allVerts.concat(this.addTri(1, 3, 0));
        // allVerts = allVerts.concat(this.addTri(0, 3, 2));
        // //allVerts.push(this.textureArray[3]);

        // //top
        // // if (!this.useColor)
        // //     gl.uniform1i(textureID, this.textureArray[4]);
        // allVerts = allVerts.concat(this.addTri(2, 3, 6));
        // allVerts = allVerts.concat(this.addTri(6, 3, 7));
        // //allVerts.push(this.textureArray[4]);

        // //bottom
        // // if (!this.useColor)
        // //     gl.uniform1i(textureID, this.textureArray[5]);
        // allVerts = allVerts.concat(this.addTri(1, 0, 5));
        // allVerts = allVerts.concat(this.addTri(5, 0, 4));

        drawTrianglesUV_OneBuffer(this.allVerts, this.texture);
        //return allVerts;

    }
}
