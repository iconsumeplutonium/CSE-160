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

let lastCalledTime, delta, fps;
function playerController() {
    const speed = 0.1;

    if (keys.w) {
        camera.moveForward(speed);
    } else if (keys.s) {
        camera.moveBackward(speed);
    } else if (keys.a) {
        camera.moveLeft(speed);
    } else if (keys.d) {
        camera.moveRight(speed);
    } else if (keys.space) {
        camera.moveUp(speed);
    } else if (keys.lshift) {
        camera.moveDown(speed);
    }

    renderAllShapes();
    //fps counter code from https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html
    if (!lastCalledTime) {
        lastCalledTime = Date.now();
        fps = 0;
    } else {
        delta = (Date.now() - lastCalledTime) / 1000;
        lastCalledTime = Date.now();
        fps = 1/delta;
    }

    fpsCounter.innerText = "FPS: " + fps.toFixed(3);
    requestAnimationFrame(playerController);
}




function convertCoordinatesToGL(ev) {
    var x = ev.clientX; 
    var y = ev.clientY; 
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return ([x, y]);
}