let fpsCounter;
let selectedSlotDisplayText;

let playerCoordDisplay = [];
let chunkCoordDisplay;

let hotbar = [];

let fovSlider;
let fovText;

let renderDistSlider;
let renderDistanceText;

function connectAllUIElements() {
    fpsCounter = document.getElementById("fps");

    selectedSlotDisplayText = document.getElementById("selectedBlock");
    selectedSlotDisplayText.innerText = `Selected Block: ${inventory[selectedSlot]}`;

    playerCoordDisplay[0] = document.getElementById(`playerCoordX`);
    playerCoordDisplay[1] = document.getElementById(`playerCoordY`);
    playerCoordDisplay[2] = document.getElementById(`playerCoordZ`);

    chunkCoordDisplay = document.getElementById("chunkCoords");

    for (let i = 0; i <= 8; i++)
        hotbar[i] = document.getElementById(`hotbar${i}`);

    selectedSlotDisplayText.innerText = titlecaseBlockName(inventory[selectedSlot]);
    hotbar[selectedSlot].style.visibility = "visible";

    fovSlider = document.getElementById("fovSlider");
    fovText = document.getElementById("fovText");
    fovText.innerText = `FOV: ${parseInt(fovSlider.value) + 60}`;

    renderDistanceText = document.getElementById("renderDistanceText");
    renderDistSlider = document.getElementById("renderDistSlider");
}

function titlecaseBlockName(block) {
    switch (block) {
        case "grass_block":
            return "Grass Block";
        case "dirt":
            return "Dirt";
        case "stone_block":
            return "Stone";
        case "cobblestone":
            return "Cobblestone";
        case "sand":
            return "Sand";
        case "gravel":
            return "Gravel";
        case "oak_planks":
            return "Oak Planks";
        case "bedrock":
            return "Bedrock";
        case "bricks":
            return "Bricks";
    }
}


function resetSlider(name) {
    let angle = 0;
    switch (name) {
        case "fovSlider":
            fovSlider.value = 30;
            updateFOV();
            return;
        case "renderDistSlider":
            renderDistSlider.value = 2;
            updateRenderDist();
            return;
        default:
            document.getElementById(name).value = 0;
            break;
    }

    renderAllShapes();
}

function updateFOV() {
    let newFov = parseInt(fovSlider.value) + 60;
    camera.fov = newFov;
    fovText.innerText = `FOV: ${newFov}`;
    camera.applyProjectionMatrix();
    renderAllShapes();
}

function updateRenderDist() {
    //render distance 0 is actually valid (somehow), but we dont want to show that to the user, so we show 1 instead
    let newRenderDist = parseInt(renderDistSlider.value) + 1;
    renderDistance = newRenderDist;
    renderDistanceText.innerText = `Render Distance: ${newRenderDist} chunks`;
    renderAllShapes();
}