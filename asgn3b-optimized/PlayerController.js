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
const speed = 10;

function selectNext() {
    hotbar[selectedSlot].style.visibility = "hidden";
    selectedSlot++;
    if (selectedSlot >= inventory.length)
        selectedSlot = 0;

    selectedSlotDisplayText.innerText = titlecaseBlockName(inventory[selectedSlot]);
    hotbar[selectedSlot].style.visibility = "visible";
}

function selectPrev() {
    hotbar[selectedSlot].style.visibility = "hidden";
    selectedSlot--;
    if (selectedSlot < 0)
        selectedSlot = inventory.length - 1;

    selectedSlotDisplayText.innerText = titlecaseBlockName(inventory[selectedSlot]);
    hotbar[selectedSlot].style.visibility = "visible";
}

let lastCalledTime, deltaTime, fps;
function playerController() {
    if (document.pointerLockElement === canvas) {
        if (keys.w)      camera.moveForward(speed * deltaTime);
        if (keys.s)      camera.moveBackward(speed * deltaTime);
        if (keys.a)      camera.moveLeft(speed * deltaTime);
        if (keys.d)      camera.moveRight(speed * deltaTime);
        if (keys.space)  camera.moveUp(speed * deltaTime);
        if (keys.lshift) camera.moveDown(speed * deltaTime);
        
        let chunkCoord = convertWorldCoordToChunkCoord(camera.eye);
        playerCoordDisplay[0].innerText = `X: ${camera.eye.x.toFixed(3)}`;
        playerCoordDisplay[1].innerText = `Y: ${camera.eye.y.toFixed(3)}`;
        playerCoordDisplay[2].innerText = `Z: ${camera.eye.z.toFixed(3)}`;
        chunkCoordDisplay.innerText = `X: ${chunkCoord.x} Y: ${chunkCoord.y}`;
    }
    
    renderAllShapes();
    displayFPS();
    updateCompass();
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