let keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    lshift: false
}

let inventory = [
    "grass_block",
    "dirt",
    "stone_block",
    "cobblestone",
    "sand",
    "gravel",
    "oak_planks",
    "bedrock",
    "bricks"
]
let selectedSlot = 0;
let selectedSlotDisplayText;

const speed = 10;

function selectNext() {
    selectedSlot++;
    if (selectedSlot >= inventory.length)
        selectedSlot = 0;

    selectedSlotDisplayText.innerText = `Selected Block: ${inventory[selectedSlot]}`;
}

function selectPrev() {
    selectedSlot--;
    if (selectedSlot < 0)
        selectedSlot = inventory.length - 1;

    selectedSlotDisplayText.innerText = `Selected Block: ${inventory[selectedSlot]}`;
}

let lastCalledTime, deltaTime, fps;
function playerController() {
    // if (document.pointerLockElement != canvas)
    //     return;

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

    renderAllShapes();
    displayFPS();
    
    let chunkCoord = convertWorldCoordToChunkCoord(camera.eye);
    cameraCoordDisplay.innerText = `X: ${camera.eye.x.toFixed(3)} Y: ${camera.eye.y.toFixed(3)} Z: ${camera.eye.z.toFixed(3)}`;
    chunkCoordDisplay.innerText = `X: ${chunkCoord.x} Y: ${chunkCoord.y} Z: ${chunkCoord.z}`;
    requestAnimationFrame(playerController);
}


function convertWorldCoordToChunkCoord(coordinate) {
    //return new Vector3([Math.floor((camera.at.x - chunkSize / 2) /  chunkSize), Math.floor((camera.at.z - chunkSize / 2) / chunkSize), 0]);
    return new Vector3([Math.floor((coordinate.x / chunkSize)), Math.floor((coordinate.z / chunkSize)), 0]);
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