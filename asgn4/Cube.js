class Cube {
    constructor(color, specularCoeff) {
        this.color = color;
        this.specularCoeff = specularCoeff;
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
        this.normals.push( 0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1);  //front
        this.normals.push( 1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0);  //right
        this.normals.push( 0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1);  //back
        this.normals.push(-1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0);  //left
        this.normals.push( 0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0);  //top
        this.normals.push( 0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0);  //bottom

        // this.colors = [];
        // for (let i = 0; i < 36; i++)
        //     this.colors =  this.colors.concat(this.color);

    }

    addTri(a, b, c) {
        let l = [];
        l = l.concat(this.coordinates[a]);
        l = l.concat(this.coordinates[b]);
        l = l.concat(this.coordinates[c]);

        return l;
    }
    
    renderFast() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform4fv(u_FragColor, new Float32Array(this.color));

        //because of some fucking javascript bullshit, passing in 0 with uniform1f/1fv completely breaks specular highlighting
        //harcoding 0.0 in the fragment shader? works fine! passing in 0.0 via a uniform float? everything dies
        //the only way I can "turn off" specular highlighting is to set the exponent to a super high number so that the highlight is invisible
        gl.uniform1f(u_SpecularExponent, (this.specularCoeff == 0) ? 9999999999 : this.specularCoeff);

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

        let normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        gl.drawArrays(gl.TRIANGLES, 0, this.allVerts.length / 3);

        gl.deleteBuffer(vertexBuffer);
        gl.deleteBuffer(normalBuffer);
    }
}
