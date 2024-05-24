let fpsCounter;

let playerCoordDisplay = [];
let chunkCoordDisplay;

let fovSlider;
let fovText;

let mouseSensitivitySlider;
let mouseSensitivityText;
let sensitivity = 6;

let compass;

let lightSliders = [];

function connectAllUIElements() {
    fpsCounter = document.getElementById("fps");

    playerCoordDisplay[0] = document.getElementById(`playerCoordX`);
    playerCoordDisplay[1] = document.getElementById(`playerCoordY`);
    playerCoordDisplay[2] = document.getElementById(`playerCoordZ`);

    chunkCoordDisplay = document.getElementById("chunkCoords");

    fovSlider = document.getElementById("fovSlider");
    fovText = document.getElementById("fovText");
    fovText.innerText = `FOV: ${parseInt(fovSlider.value) + 60}`;

    mouseSensitivitySlider = document.getElementById("mouseSensitivitySlider");
    mouseSensitivityText = document.getElementById("mouseSensitivityText");
    sensitivity = 6;
    updateMouseSensitivity();

    compass = document.getElementById("compass");
    compass.innerText = "Facing north (towards -Z)";
    compass.style.color = 'blue';
    updateCompass();

    lightSliders[0] = document.getElementById(`lightXslider`);
    lightSliders[1] = document.getElementById(`lightYslider`);
    lightSliders[2] = document.getElementById(`lightZslider`);
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
    //cameraDir.y = 0;

    const NS_dir = north.dot(cameraDir);
    if (NS_dir > 0.9) {
        compass.innerText = "Facing north (towards -Z)";
        compass.style.color = 'blue';
        return;
    } else if (NS_dir < -0.9) {
        compass.innerText = "Facing south (towards +Z)";
        compass.style.color = 'blue';
        return;
    } else {
        const east = new Vector3([1, 0, 0]);
        const WE_dir = east.dot(cameraDir);

        if (WE_dir > 0.9) {
            compass.innerText = "Facing east (towards +X)"
            compass.style.color = 'red';
        } else if (WE_dir < -0.9) {
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