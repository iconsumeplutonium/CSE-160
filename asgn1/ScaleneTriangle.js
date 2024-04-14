//a modified version of Triangle.js whose corner points can be placed at any three specified vertices, rather than always being placed
//to make an equilateral triangle
//vertices -> an array of three indices of the coordinates array
class ScaleneTriangle {
    constructor(vertices, color) {
        this.color = color;

        let verts = [];
        for (let i = 0; i < vertices.length; i++) {
            let coord = coordinates[vertices[i]];
            verts.push(coord[0]);
            verts.push(coord[1]);
        }

        this.vertices = new Float32Array(verts);
    }

    render() {
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);

        var n = 3;

        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
      
        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
      
        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
      
        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        gl.drawArrays(gl.TRIANGLES, 0, n);
    }     
}
