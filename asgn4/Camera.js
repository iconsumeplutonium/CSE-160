class Camera {
    constructor(fov) {
        this.fov = fov;
        this.eye = new Vector3([-32, 17, 36]);
        this.at = new Vector3([1, -1, -1]);
        this.up = new Vector3([0, 1, 0]);

        this.nearDist = 0.1;
        this.farDist = 200;
        this.aspectRatio = canvas.width / canvas.height;

        this.viewMatrix = new Matrix4().setIdentity();
        this.applyViewMatrix();

        this.projectionMatrix = new Matrix4().setIdentity();
        this.applyProjectionMatrix();
    }

    get forward() {
        return this.at.sub(this.eye).normalize();
    }

    get right() {
        return this.forward.cross(this.up).normalize();
    }

    applyProjectionMatrix() {
        this.projectionMatrix.setPerspective(this.fov, this.aspectRatio, this.nearDist, this.farDist);
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