class Circle {
    constructor(position, color, size, segments) {
        this.pos = position;
        this.color = color;
        this.size = size / 100;

        let angle = 360 / segments;

        let v = [this.pos[0], this.pos[1]];
        for (let i = 0; i <= 360; i += angle) {
            let radians = i * Math.PI / 180;
            let offsetX = Math.cos(radians) * this.size;
            let offsetY = Math.sin(radians) * this.size;

            v.push((this.pos[0] + offsetX));
            v.push((this.pos[1] + offsetY));
        }

        this.vertices = new Float32Array(v);

    }

    render() {
        gl.uniform1f(a_Size, this.size);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);

        var n = this.vertices.length / 2;

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

        gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
    }     
}
