function drawTrianglesUV_OneBuffer(vertices, uvs) {
    //console.log(uvs);

    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create buffer obj');
        return -1;
    }

    let verticesF32 = new Float32Array(vertices);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesF32, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);


    let uvBuffer = gl.createBuffer();
    if (!uvBuffer) {
        console.log('failed to make uv buffer obj');
        return -1;
    }
    let uvsF32 = new Float32Array(uvs);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvsF32, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    
    // let matrixBuffer = gl.createBuffer();
    // if (!matrixBuffer) {
    //     console.log('failed to make matrix buffer obj');
    //     return -1
    // }
    // let matricesF32 = new Float32Array(matrices);
    // gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, matricesF32, gl.DYNAMIC_DRAW);
    // gl.vertexAttribPointer(u_ModelMatrix, 16, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(u_ModelMatrix);



    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);

    //without this, js gc would cause massive stutters of up to 2 seconds
    gl.deleteBuffer(vertexBuffer);
    gl.deleteBuffer(uvBuffer);
}