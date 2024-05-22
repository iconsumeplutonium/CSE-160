class Lambda {
    constructor(color) {
        this.color = color;
        this.matrix = null;

        //coordinates calculated with desmos
        //https://www.desmos.com/calculator/l2ap0lvkse
        let thickness = 0.01;
        this.coordinates = [
            [-0.517,  0.904, 0],
            [-0.025,  0.904, 0],
            [-0.519,  0.623, 0],
            [-0.233,  0.623, 0],
            [-0.132,  0.389, 0],
            [0.01, -0.02, 0],
            [0.361,  -0.9524, 0],
            [-0.885, -0.86, 0],
            [-0.5,   -0.86, 0],
            [0.883,  -0.7916, 0],
            [0.8095, -0.504, 0],
            [0.5557, -0.576, 0],
        ]

        this.v = [];
        this.colors = [];
        
        this.coordToTri([2, 0, 3]);
        this.coordToTri([3, 0, 1]);
        this.coordToTri([6, 3, 1]);
        this.coordToTri([7, 4, 5]);
        this.coordToTri([7, 5, 8]);
        this.coordToTri([6, 1, 11]);
        this.coordToTri([6, 11, 9]);
        this.coordToTri([9, 11, 10]);

        this.vertices = new Float32Array(this.v);
    }

    coordToTri(indices) {
        for (let i = 0; i < 3; i++) {
            let coord = this.coordinates[indices[i]];

            for (let j = 0; j < coord.length; j++) {
                this.v.push(coord[j]);
                this.colors.push(this.color[0], this.color[1], this.color[2], this.color[3]);
            }
        }
    }

    render() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var n = this.vertices.length / 3;

        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        let colorBuffer = gl.createBuffer();
        if (!colorBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
      

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.DYNAMIC_DRAW);    
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);        
        gl.enableVertexAttribArray(a_Color);

        gl.drawArrays(gl.TRIANGLES, 0, n);
    }     
}
