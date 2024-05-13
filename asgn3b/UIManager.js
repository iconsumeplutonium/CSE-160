let fpsCounter;
let selectedSlotDisplayText;

let playerCoordDisplay = [];
let chunkCoordDisplay;

let hotbar = [];

let fovSlider;
let fovText;

let renderDistSlider;
let renderDistanceText;

let mouseSensitivitySlider;
let mouseSensitivityText;
let sensitivity = 6;

let compass;

let seedBox;
let worldSeed;

let disableFoliageCheckbox;

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
    renderDistanceText.innerText = `Render Distance: ${parseInt(renderDistSlider.value)} chunks`;
    renderDistance = parseInt(renderDistSlider.value);

    mouseSensitivitySlider = document.getElementById("mouseSensitivitySlider");
    mouseSensitivityText = document.getElementById("mouseSensitivityText");
    sensitivity = 6;
    updateMouseSensitivity();

    compass = document.getElementById("compass");
    compass.innerText = "Facing north (towards -Z)";
    compass.style.color = 'blue';
    updateCompass();

    seedBox = document.getElementById("seedBox");
    seedBox.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    seedBox.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            updateSeed();
        }
    });

    disableFoliageCheckbox = document.getElementById("disableFoliageCheckbox");
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
        case "mouseSensitivitySlider":
            mouseSensitivitySlider.value = 200;
            updateMouseSensitivity();
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
    let newRenderDist = parseInt(renderDistSlider.value);
    renderDistance = newRenderDist;
    renderDistanceText.innerText = `Render Distance: ${newRenderDist} chunks`;
    renderAllShapes();
}

function updateMouseSensitivity() {
    sensitivity = parseInt(mouseSensitivitySlider.value);
    mouseSensitivityText.innerText = `Mouse Sensitivity: ${sensitivity}`;
}

function updateCompass() {
    const north = new Vector3([0, 0, -1]);
    
    let cameraDir = camera.forward;
    cameraDir.y = 0;

    const NS_dir = north.dot(cameraDir);
    if (NS_dir > 0.98) {
        compass.innerText = "Facing north (towards -Z)";
        compass.style.color = 'blue';
        return;
    } else if (NS_dir < -0.98) {
        compass.innerText = "Facing south (towards +Z)";
        compass.style.color = 'blue';
        return;
    } else {
        const east = new Vector3([1, 0, 0]);
        const WE_dir = east.dot(cameraDir);

        if (WE_dir > 0.98) {
            compass.innerText = "Facing east (towards +X)"
            compass.style.color = 'red';
        } else if (WE_dir < -0.98) {
            compass.innerText = "Facing west (towards -X)";
            compass.style.color = 'red';
        }
    }
}

function randomSeed() {
    worldSeed = Math.floor(Math.random() * 4294967295);
    seedBox.value = worldSeed;
    updateSeed();
}

function updateSeed() {
    worldSeed = parseInt(seedBox.value)
    terrainChunkDict.clear();
    main(false);
}