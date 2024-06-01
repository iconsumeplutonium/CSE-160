//import * as three from 'three';

export let wireframeViewCheckbox;
export let slider1;

let fpsCounter;

export function connectUIElements() {
    fpsCounter = document.getElementById("fpsCounter");
    wireframeViewCheckbox = document.getElementById("wireframeViewCheckbox");
    slider1 = document.getElementById("slider1");
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