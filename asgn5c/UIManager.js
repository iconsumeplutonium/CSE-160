import datGui from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/+esm';

export let guiValues = {
    fps: "0",
    useEnvRflct: true,
    useScattering: true,
    lightX: 0,
    resetX: function() {
        this.lightX = 0;
    },
    lightZ: 0,
    resetZ: function() {
        this.lightZ = 0;
    }
};

// let colorPicker;
let gui;

export function connectUIElements() {
    gui = new datGui.GUI({width: 350});
    let fpsCounterGUI = gui.add(guiValues, 'fps').name('FPS');
    fpsCounterGUI.domElement.querySelector('input').disabled = true;

    gui.add(guiValues, 'useEnvRflct').name('Environment Reflections');
    gui.add(guiValues, 'useScattering').name('Subsurface Scattering');
    
    const lightFolder = gui.addFolder('Light Position');
    lightFolder.open();
    lightFolder.add(guiValues, 'lightX', -400, 400).name('X');
    lightFolder.add(guiValues, 'resetX').name('Reset X');
    
    lightFolder.add(guiValues, 'lightZ', -400, 400).name('Z');
    lightFolder.add(guiValues, 'resetZ').name('Reset Z');

    //colorPicker = document.getElementById("colorPicker");
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

    guiValues.fps = fps.toFixed(3);
    gui.updateDisplay();
}

// export function getLightColor() {
//     let color = colorPicker.value;

//     let r = parseInt(color.slice(1, 3), 16) / 255;
//     let g = parseInt(color.slice(3, 5), 16) / 255;
//     let b = parseInt(color.slice(5, 7), 16) / 255;

//     return new three.Color(r, g, b);
// }