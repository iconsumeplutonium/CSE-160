class Sphere {
    constructor(size, matrix, radius) {
        this.matrix = matrix;


        let d = Math.PI / 10;
        let dd = Math.PI / 10;

        this.vertices = [];
        this.colors = [];
        this.normals = [];
        for (let t = 0; t < Math.PI; t += d) {
            for (let r = 0; r < 2 * Math.PI; r += d) {
                let p1 = [Math.sin(t)      * Math.cos(r),        Math.sin(t)      * Math.sin(r),             Math.cos(t)];
                let p2 = [Math.sin(t + dd) * Math.cos(r),        Math.sin(t + dd) * Math.sin(r),             Math.cos(t + dd)];
                let p3 = [Math.sin(t)      * Math.cos(r + dd),   Math.sin(t)      * Math.sin(r + dd),        Math.cos(t)];
                let p4 = [Math.sin(t + dd) * Math.cos(r + dd),   Math.sin(t + dd) * Math.sin(r + dd),        Math.cos(t + dd)];

                this.vertices = this.vertices.concat(p1, p2, p3);
                this.normals = this.normals.concat(p1, p2, p3);
                this.colors.push(1, 1, 1, 1);

                this.vertices = this.vertices.concat(p4, p3, p2);
                this.normals = this.normals.concat(p4, p3, p2);
                this.colors.push(1, 1, 1, 1);
            }
        }

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
        //gl.uniform3fv(u_FragColor, new Float32Array([0, 1, 1, 1]));

        this.normalMatrix.setInverseOf(this.matrix);
        this.normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);


        var n = this.vertices.length / 3;

        let vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // let colorBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.DYNAMIC_DRAW);
        // gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(a_Color);

        let normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);        
        gl.enableVertexAttribArray(a_Normal);

        let colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_FragColor, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_FragColor);

        gl.drawArrays(gl.TRIANGLES, 0, n);

        gl.deleteBuffer(vertexBuffer);
        //gl.deleteBuffer(colorBuffer);
        gl.deleteBuffer(normalBuffer);
    }
}