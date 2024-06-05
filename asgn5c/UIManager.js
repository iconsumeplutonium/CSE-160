import * as three from 'three';

export let envReflectCheckbox;
export let scatteringCheckbox;
export let slider1;
export let slider2;
export let slider3;

let fpsCounter;
let colorPicker;

export function connectUIElements() {
    fpsCounter = document.getElementById("fpsCounter");

    envReflectCheckbox = document.getElementById("envReflectCheckbox");
    scatteringCheckbox = document.getElementById("scatteringCheckbox");

    slider1 = document.getElementById("slider1");
    slider2 = document.getElementById("slider2");
    slider3 = document.getElementById("slider3");

    colorPicker = document.getElementById("colorPicker");
}


let lastCalledTime, fps, delta;
export function displayFPS() {
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
}

export function getLightColor() {
    let color = colorPicker.value;

    let r = parseInt(color.slice(1, 3), 16) / 255;
    let g = parseInt(color.slice(3, 5), 16) / 255;
    let b = parseInt(color.slice(5, 7), 16) / 255;

    return new three.Color(r, g, b);
}