class Camera {
    constructor(fov) {
        this.fov = fov;
        this.eye = new Vector3([0, 50, 0]);
        this.at = new Vector3([0, 48, 1]);
        this.up = new Vector3([0, 1, 0]);

        this.nearDist = 0.1;
        this.farDist = 100;
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

    //height of the near clipping plane
    get Hnear() {
        return 2 * Math.tan(this.fov / 2) * this.nearDist;
    }

    //width of the near clipping plane
    get Wnear() {
        return this.Hnear * this.aspectRatio;
    }

    //height of the far clipping plane
    get Hfar() {
        return 2 * Math.tan(this.fov / 2) * this.farDist;
    }

    //width of the far clipping plane
    get Wfar() {
        return this.Hfar * this.aspectRatio;
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

    pointIsVisible(point) {
        //https://www.lighthouse3d.com/tutorials/view-frustum-culling/geometric-approach-extracting-the-planes/

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(mouseDelta.y * -sensitivity * deltaTime, camera.right.x, camera.right.y, camera.right.z);

        let localForward = rotationMatrix.multiplyVector3(this.forward).normalize();
        let localUp = rotationMatrix.multiplyVector3(this.up).normalize();
        let localRight = localForward.cross(localUp);

                
        const fc = this.eye.add(localForward.mul(this.farDist)); //center of the far clipping plane
        const nc = this.eye.add(localForward.mul(this.nearDist)); //center of the near clipping plane

        //near plane
        if (this.signedDistance(localForward, nc, point) < 0)
            return false;

        //far plane
        if (this.signedDistance(localForward.mul(-1), fc, point) < 0)
            return false;

        //right plane
        let a = nc.add(localRight.mul(this.Wnear / 2)).sub(this.eye).normalize();
        let normal = localUp.cross(a);
        if (this.signedDistance(normal, camera.eye, point) < 0)
            return false;

        //left plane
        a = nc.sub(localRight.mul(this.Wnear / 2)).sub(this.eye).normalize();
        normal = a.cross(localUp);
        if (this.signedDistance(normal, camera.eye, point) < 0)
            return false;

        //top plane
        a = nc.add(localUp.mul(this.Hnear / 2)).sub(this.eye).normalize();
        normal = a.cross(localRight);
        if (this.signedDistance(normal, camera.eye, point) < 0)
            return false;

        //bottom plane
        a = nc.sub(localUp.mul(this.Hnear / 2)).sub(this.eye).normalize();
        normal = localRight.cross(a);
        if (this.signedDistance(normal, camera.eye, point) < 0)
            return false;

        return true;
    }

    signedDistance(planeNormal, pointOnPlane, pointToTest) {
        return planeNormal.dot(pointToTest.sub(pointOnPlane));
    }



}