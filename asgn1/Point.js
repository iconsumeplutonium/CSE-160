class Point {
    constructor(position, color, size) {
        this.pos = position;
        this.color = color;
        this.size = size;
    }

    render() {
        gl.disableVertexAttribArray(a_Position);
        gl.vertexAttrib3f(a_Position, this.pos[0], this.pos[1], 0.0);
        gl.uniform1f(a_Size, this.size);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}
