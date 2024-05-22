class Sphere {
    constructor(size, matrix, radius) {
        this.matrix = matrix;

        //generate points
        let cartesianPoints = new Array(size);

        for (let i = 0; i <= size; i++) {
            let latitude = Math.PI * i / size;
            cartesianPoints[i] = new Array(size);

            for (let j = 0; j <= size; j++) {
                let longitude = 2 * Math.PI * j / size;
                let point = this.spherical2cartesian(latitude, longitude, radius);
                cartesianPoints[i][j] = point;
            }
        }

        //convert points to vertices
        this.vertices = [];
        this.colors = [];
        this.normals = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                this.vertices = this.vertices.concat(cartesianPoints[i][j].x)
                this.vertices = this.vertices.concat(cartesianPoints[i][j].y)
                this.vertices = this.vertices.concat(cartesianPoints[i][j].z)
                this.colors.push(1, 1, 1, 1);
                let normal = cartesianPoints[i][j].normalize();
                this.normals.push(normal.x, normal.y, normal.z);
                
                this.vertices = this.vertices.concat(cartesianPoints[i][j + 1].x);
                this.vertices = this.vertices.concat(cartesianPoints[i][j + 1].y);
                this.vertices = this.vertices.concat(cartesianPoints[i][j + 1].z);
                this.colors.push(1, 1, 1, 1);
                normal = cartesianPoints[i][j + 1].normalize();
                this.normals.push(normal.x, normal.y, normal.z);

                this.vertices = this.vertices.concat(cartesianPoints[i + 1][j].x);
                this.vertices = this.vertices.concat(cartesianPoints[i + 1][j].y);
                this.vertices = this.vertices.concat(cartesianPoints[i + 1][j].z);
                this.colors.push(1, 1, 1, 1);
                normal = cartesianPoints[i + 1][j].normalize();
                this.normals.push(normal.x, normal.y, normal.z);

                this.vertices = this.vertices.concat(cartesianPoints[i][j + 1].x);
                this.vertices = this.vertices.concat(cartesianPoints[i][j + 1].y);
                this.vertices = this.vertices.concat(cartesianPoints[i][j + 1].z);
                this.colors.push(1, 1, 1, 1);
                normal = cartesianPoints[i][j + 1].normalize();
                this.normals.push(normal.x, normal.y, normal.z);

                this.vertices = this.vertices.concat(cartesianPoints[i + 1][j + 1].x);
                this.vertices = this.vertices.concat(cartesianPoints[i + 1][j + 1].y);
                this.vertices = this.vertices.concat(cartesianPoints[i + 1][j + 1].z);
                this.colors.push(1, 1, 1, 1);
                normal = cartesianPoints[i + 1][j + 1].normalize();
                this.normals.push(normal.x, normal.y, normal.z);

                this.vertices = this.vertices.concat(cartesianPoints[i + 1][j].x);
                this.vertices = this.vertices.concat(cartesianPoints[i + 1][j].y);
                this.vertices = this.vertices.concat(cartesianPoints[i + 1][j].z);
                this.colors.push(1, 1, 1, 1);
                normal = cartesianPoints[i + 1][j].normalize();
                this.normals.push(normal.x, normal.y, normal.z);

            }
        }

        //get colors
        for (let i = 0; i <= size * size; i++) {
            this.colors.push(1, 1, 1, 1);
        }

        //console.log(this.colors)
        this.normalMatrix = new Matrix4();
    }

    spherical2cartesian(lat, long, radius) {
        let x = radius * Math.sin(lat) * Math.cos(long);
        let y = radius * Math.sin(lat) * Math.sin(long);
        let z = radius * Math.cos(lat);

        return new Vector3([x, y, z]);
    }

    render() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        this.normalMatrix.setInverseOf(this.matrix);
        this.normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);


        var n = this.vertices.length / 3;

        let vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        let colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);        
        gl.enableVertexAttribArray(a_Color);

        let normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);        
        gl.enableVertexAttribArray(a_Normal);

        gl.drawArrays(gl.TRIANGLES, 0, n);
    }
}