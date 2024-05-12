class Camera {
    constructor(fov) {
        this.fov = fov;
        this.eye = new Vector3([0, 50, 3]);
        this.at = new Vector3([0, -1, 0]);
        this.up = new Vector3([0, 1, 0]);

        this.viewMatrix = new Matrix4().setIdentity();
        this.applyViewMatrix();

        this.projectionMatrix = new Matrix4().setIdentity();
        this.applyProjectionMatrix();
    }

    get forward() {
        return this.at.sub(this.eye).normalize();
    }

    get right() {
        return Vector3.cross(this.forward, this.up).normalize();
    }

    applyProjectionMatrix() {
        this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 100);
        gl.uniformMatrix4fv(u_ProjectionMatrix, false, this.projectionMatrix.elements);
    }

    applyViewMatrix() {
        this.viewMatrix.setLookAt(this.eye.x, this.eye.y, this.eye.z, this.at.x, this.at.y, this.at.z, this.up.x, this.up.y, this.up.z);
        gl.uniformMatrix4fv(u_ViewMatrix, false, this.viewMatrix.elements);
    }

    moveForward(speed) {
        let forwardVector = this.forward.mul(speed);

        this.eye = this.eye.add(forwardVector);
        this.at = this.at.add(forwardVector);
    }

    moveBackward(speed) {
        let forwardVector = this.forward.mul(speed);

        this.eye = this.eye.sub(forwardVector);
        this.at = this.at.sub(forwardVector);
    }

    moveLeft(speed) {
        let rightVector = this.right.mul(speed);

        camera.eye = camera.eye.sub(rightVector);    
        camera.at = camera.at.sub(rightVector);
    }

    moveRight(speed) {
        let rightVector = this.right.mul(speed);

        camera.eye = camera.eye.add(rightVector);    
        camera.at = camera.at.add(rightVector);
    }

    moveUp(speed) {
        let upVector = this.up.mul(speed);

        camera.eye = camera.eye.add(upVector);
        camera.at = camera.at.add(upVector);
    }

    moveDown(speed) {
        let upVector = this.up.mul(speed);

        camera.eye = camera.eye.sub(upVector);
        camera.at = camera.at.sub(upVector);
    }



}