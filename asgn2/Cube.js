class Cube {
    constructor(color, matrix) {
        this.color = color;
        this.matrix = matrix;

        this.cornerCoords = [
            [0, 0, 0],//0
            [0, 0, 1],//1
            [0, 1, 0],//2
            [0, 1, 1],//3
            [1, 0, 0],//4
            [1, 0, 1],//5
            [1, 1, 0],//6
            [1, 1, 1],//7
        ];

        this.v = [];
        this.colorModifiers = [1, 0.9]
        this.colors = [];

        this.coordToTri([0, 2, 4], 1);
        this.coordToTri([4, 2, 6], 1);

        this.coordToTri([4, 6, 5], 0.9);
        this.coordToTri([5, 6, 7], 0.9);

        this.coordToTri([5, 7, 1], 0.9);
        this.coordToTri([1, 7, 3], 0.9);

        this.coordToTri([1, 3, 0], 0.9);
        this.coordToTri([0, 3, 2], 0.8);

        this.coordToTri([2, 3, 6], 0.9);
        this.coordToTri([6, 3, 7], 0.9);

        this.coordToTri([1, 0, 5], 0.9);
        this.coordToTri([5, 0, 4], 0.9);

        this.vertices = new Float32Array(this.v);
    }

    coordToTri(indices, mod) {
        for (let j = 0; j < indices.length; j++) {
            let index = indices[j];
            for (let i = 0; i < 3; i++) {
                this.v.push(this.cornerCoords[index][i]);
                this.colors.push(this.color[0] * mod, this.color[1] * mod, this.color[2] * mod, this.color[3]); //a new color buffer, because I don't have a drawTriangles lol
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
