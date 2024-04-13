class Triangle {
    constructor(position, color, size) {
        this.pos = position;
        this.color = color;
        this.size = size;

        //I wanted the coordinate that gets clicked to be the center of the triangle
        //so in desmos, using the origin as the center I graphed the points (-3, -2) and (3, -2) to be bottom two vertices
        //with some math, i calculated the third vertex to be at (0, sqrt(11))
        //multiplying each of these coordinates by a scale factor lets me grow or shrink the triangle
        let scaleFactor = 500;
        this.vertices = new Float32Array([
            ((-3 * size) / scaleFactor) + this.pos[0],       ((-2 * size) / scaleFactor) + this.pos[1],
            (( 3 * size) / scaleFactor) + this.pos[0],       ((-2 * size) / scaleFactor) + this.pos[1],
            this.pos[0],                                     ((Math.sqrt(11) * size) / scaleFactor) + this.pos[1]
        ])

        //however, since webGL goes from (-1, -1) to (1, 1) i need to shrink these coordinates
        //so i divide them all by scaleFactor
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i] / scaleFactor;
        }

    }

    render() {
        gl.uniform1f(a_Size, this.size);
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
