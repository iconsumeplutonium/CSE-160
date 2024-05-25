let fpsCounter;

let playerCoordDisplay = [];

let fovSlider;
let fovText;

let mouseSensitivitySlider;
let mouseSensitivityText;
let sensitivity = 6;

let compass;

let lightSliders = [];

let lightColorPicker;
let lightSelector;

let spotlightAngleSlider, spotlightAngleText;
let spotlightFalloffSlider, spotlightFalloffText;

let enableLightRotationCheckbox;

function connectAllUIElements() {
    fpsCounter = document.getElementById("fps");

    playerCoordDisplay[0] = document.getElementById(`playerCoordX`);
    playerCoordDisplay[1] = document.getElementById(`playerCoordY`);
    playerCoordDisplay[2] = document.getElementById(`playerCoordZ`);

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

    lightColorPicker = document.getElementById("lightColorPicker");
    lightSelector = document.getElementById("lightSelector");

    spotlightAngleSlider = document.getElementById("spotlightAngleSlider");
    spotlightAngleText = document.getElementById("spotlightAngleText");
    updateSpotlightAngleText();

    spotlightFalloffSlider = document.getElementById("spotlightFalloffSlider");
    spotlightFalloffText = document.getElementById("spotlightFalloffText");
    updateSpotlightFalloffText();

    enableLightRotationCheckbox = document.getElementById("enableLightRotationCheckbox");
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
        case "lightYslider":
            lightSliders[1].value = 25;
            break;
        case "spotlightAngleSlider":
            spotlightAngleSlider.value = 50;
            updateSpotlightAngleText();
            break;
        case "spotlightFalloffSlider":
            spotlightFalloffSlider.value = 57;
            updateSpotlightFalloffText();
            break;            
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

function getLightColor() {
    let color = lightColorPicker.value;

    let r = parseInt(color.slice(1, 3), 16) / 255;
    let g = parseInt(color.slice(3, 5), 16) / 255;
    let b = parseInt(color.slice(5, 7), 16) / 255;

    return new Vector3([r, g, b]);
}

function setRenderMode(value) {
    console.log(value);
    gl.uniform1i(u_RenderingMode, value);
}

function updateSpotlightAngleText() {
    let angle = 90 - Math.acos(parseFloat(spotlightAngleSlider.value) / 100) * (180 / Math.PI);
    spotlightAngleText.innerText = `Spotlight Angle: ${angle.toFixed(2)}°`;
}

function updateSpotlightFalloffText() {
    let angle = spotlightFalloffSlider.value / 10;
    spotlightFalloffText.innerText = `Spotlight Falloff Exponent: ${angle.toFixed(2)}`;
}
