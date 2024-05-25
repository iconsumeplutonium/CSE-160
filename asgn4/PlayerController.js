let keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    lshift: false
}


const speed = 35;

let lastCalledTime, deltaTime, fps;
function playerController(time) {
    if (document.pointerLockElement === canvas) {
        if (keys.w) {
            camera.moveForward(speed * deltaTime);
        } else if (keys.s) {
            camera.moveBackward(speed * deltaTime);
        } else if (keys.a) {
            camera.moveLeft(speed * deltaTime);
        } else if (keys.d) {
            camera.moveRight(speed * deltaTime);
        } else if (keys.space) {
            camera.moveUp(speed * deltaTime);
        } else if (keys.lshift) {
            camera.moveDown(speed * deltaTime);
        }
        
        playerCoordDisplay[0].innerText = `X: ${camera.eye.x.toFixed(3)}`;
        playerCoordDisplay[1].innerText = `Y: ${camera.eye.y.toFixed(3)}`;
        playerCoordDisplay[2].innerText = `Z: ${camera.eye.z.toFixed(3)}`;
    }
    
    renderAllShapes(time);
    displayFPS();
    updateCompass();
    requestAnimationFrame(playerController);
}


function displayFPS() {
    //fps counter code from https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html
    if (!lastCalledTime) {
        lastCalledTime = Date.now();
        fps = 0;
    } else {
        deltaTime = (Date.now() - lastCalledTime) / 1000;
        lastCalledTime = Date.now();
        fps = 1/deltaTime;
    }

    fpsCounter.innerText = "FPS: " + fps.toFixed(3);
}