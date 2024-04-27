var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotationMatrix;
    varying vec4 v_Color;
    void main() {
        gl_Position = u_GlobalRotationMatrix * u_ModelMatrix * a_Position;
        v_Color = a_Color;
    }`;

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
        gl_FragColor = v_Color;
    }`;


let canvas, gl;
let a_Position, a_Color, u_ModelMatrix, u_GlobalRotationMatrix;
let globalRotx, globalRoty, globalRotz;
let xSlider, ySlider, zSlider;
let lHipSlider, rHipSlider;
let lKneeSlider, rKneeSlider;
let lShoulderSlider, rShoulderSlider;
let lElbowSlider, rElbowSlider;
let audio;
let animationSelector;
let crowbarButton;
let animationRequestID;

function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (!a_Color) {
        console.log('Failed to get the storage location of v_Color');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotationMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotationMatrix');
    if (!u_GlobalRotationMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotationMatrix');
        return;
    }
}


let glob;
function main() {
    setupWebGL();
    connectVariablesToGLSL();

    //adding a mousemove event listener causes the cube to only start rendering after like 20 seconds
    //doing it this method causes no delay
    xSlider = document.getElementById("xSlider");
    ySlider = document.getElementById("ySlider");
    zSlider = document.getElementById("zSlider");

    lHipSlider = document.getElementById("left_hip");
    rHipSlider = document.getElementById("right_hip");
    lKneeSlider = document.getElementById("left_knee");
    rKneeSlider = document.getElementById("right_knee");
    lShoulderSlider = document.getElementById("left_shoulder");
    rShoulderSlider = document.getElementById("right_shoulder");
    lElbowSlider = document.getElementById("left_elbow");
    rElbowSlider = document.getElementById("right_elbow");

    audio = new Audio('sounds/crowbar.mp3');

    animationSelector = document.getElementById("animationSelect");
    animationSelector.addEventListener('change', OnAnimationSelect)

    crowbarButton = document.getElementById("crowbarAnimationButton");

    gl.clearColor(0.09, 0.56, 0.69, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    glob = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, glob.elements);

    renderAllShapes();
}



let headRotation = [0, 0, 0];
let leftArmRotation = [0, 0, 0]; //shoulder, elbow, hand
let rightArmRotation = [0, 0, 0]; //shoulder, elbow, hand
let leftLegRotation = [0, 0]; //hip, knee
let rightLegRotation = [0, 0]; //hip, knee
function renderAllShapes() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    glob.setRotate(-xSlider.value, 1, 0, 0);
    glob.rotate(ySlider.value, 0, 1, 0);
    glob.rotate(zSlider.value, 0, 0, 1);
    gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, glob.elements);

    // let x = document.getElementById("whereSliderX").value / 100;
    // let y = document.getElementById("whereSliderY").value / 100;
    // let z = document.getElementById("whereSliderZ").value / 100;
    // let text = document.getElementById("cubeLocationText");
    // text.innerText = x + ", " + y + ", " + z

    //#region HEAD-------------------------------------------------------------
    //Base head
    let baseHeadMatrix;
    let headBase = new Cube2(skinColor);
    headBase.matrix = new Matrix4().setIdentity();
    headBase.matrix.setTranslate(-0.18, 0.31, -0.09);
    headBase.matrix.multiply(new Matrix4().setScale(-1, -1, -1)); //because im awesome and accidentally made it upside down
    headBase.matrix.rotate(headRotation[0], 1, 0, 0);
    headBase.matrix.rotate(headRotation[1], 0, 1, 0);
    headBase.matrix.rotate(headRotation[2], 0, 0, 1);
    baseHeadMatrix = headBase.matrix;
    headBase.matrix.scale(0.35, 0.35, 0.35);
    headBase.render();

    //hair on left side
    let hairLeft = new Cube(hairColor);
    hairLeft.matrix = new Matrix4(baseHeadMatrix);
    hairLeft.matrix.scale(1, 0.4, 0.1)
    hairLeft.matrix.translate(-0.25, -0.6, -3.1);
    hairLeft.render();

    let hairLeftBack = new Cube(hairColor);
    hairLeftBack.matrix = new Matrix4(baseHeadMatrix);
    hairLeftBack.matrix.scale(0.3, 0.4, 0.1)
    hairLeftBack.matrix.translate(0.33, -0.1, -3.1);
    hairLeftBack.render();

    let leftEar = new Cube(earColor);
    leftEar.matrix = new Matrix4(baseHeadMatrix);
    leftEar.matrix.scale(0.3, 0.4, 0.05)
    leftEar.matrix.translate(-0.2, -0.05, -5.5);
    leftEar.render();

    let hairLeftSideBurn = new Cube(hairColor);
    hairLeftSideBurn.matrix = new Matrix4(baseHeadMatrix);
    hairLeftSideBurn.matrix.scale(0.2, 0.35, 0.1)
    hairLeftSideBurn.matrix.translate(-0.8, -0.12, -3.1);
    hairLeftSideBurn.render();


    //hair on right side
    let hairRight = new Cube(hairColor);
    hairRight.matrix = new Matrix4(baseHeadMatrix);
    hairRight.matrix.scale(1, 0.4, 0.1)
    hairRight.matrix.translate(-0.25, -0.6, 2.5);
    hairRight.render();

    let hairRightBack = new Cube(hairColor);
    hairRightBack.matrix = new Matrix4(baseHeadMatrix);
    hairRightBack.matrix.scale(0.3, 0.4, 0.1)
    hairRightBack.matrix.translate(0.33, -0.1, 2.5);
    hairRightBack.render();

    let rightEar = new Cube(earColor);
    rightEar.matrix = new Matrix4(baseHeadMatrix);
    rightEar.matrix.scale(0.3, 0.4, 0.05);
    rightEar.matrix.translate(-0.2, -0.05, 4.8);
    rightEar.render();

    let hairRightSideBurn = new Cube(hairColor);
    hairRightSideBurn.matrix = new Matrix4(baseHeadMatrix);
    hairRightSideBurn.matrix.scale(0.2, 0.35, 0.1);
    hairRightSideBurn.matrix.translate(-0.8, -0.12, 2.5);
    hairRightSideBurn.render();


    //hair on top of head
    let hairTop = new Cube(hairColor);
    hairTop.matrix = new Matrix4(baseHeadMatrix);
    hairTop.matrix.translate(-0.3, -0.366, -0.315);
    hairTop.matrix.scale(1.1, 0.25, 1.23);
    hairTop.render();

    
    //hair on back of head
    let hairBack = new Cube(hairColor);
    hairBack.matrix = new Matrix4(baseHeadMatrix);
    hairBack.matrix.translate(0.25, -0.37, -0.3);
    hairBack.matrix.scale(0.2, 1.2, 1.2);
    hairBack.render();


    //glasses, top frame
    let glassesTop = new Cube(glassesColor);
    glassesTop.matrix = new Matrix4(baseHeadMatrix);
    glassesTop.matrix.translate(-0.3, -0.15, -0.254);
    glassesTop.matrix.scale(0.1, 0.1, 1.01);
    glassesTop.render();

    //glasses, right lens, right vertical bar
    let glassesRightLensRightVertical = new Cube(glassesColor);
    glassesRightLensRightVertical.matrix = new Matrix4(baseHeadMatrix);
    glassesRightLensRightVertical.matrix.translate(-0.3, -0.1, 0.2);
    glassesRightLensRightVertical.matrix.scale(0.1, 0.2, 0.1);
    glassesRightLensRightVertical.render();

    //glasses, right lens, left vertical bar
    let glassesRightLensLeftVertical = new Cube(glassesColor);
    glassesRightLensLeftVertical.matrix = new Matrix4(baseHeadMatrix);
    glassesRightLensLeftVertical.matrix.translate(-0.3, -0.1, 0.02);
    glassesRightLensLeftVertical.matrix.scale(0.1, 0.2, 0.1);
    glassesRightLensLeftVertical.render();

    //glasses, left lens, right vertical bar
    let glassesLeftLensRightVertical = new Cube(glassesColor);
    glassesLeftLensRightVertical.matrix = new Matrix4(baseHeadMatrix);
    glassesLeftLensRightVertical.matrix.translate(-0.3, -0.1, -0.08);
    glassesLeftLensRightVertical.matrix.scale(0.1, 0.2, 0.1);
    glassesLeftLensRightVertical.render();

    //glasses, left lens, left vertical bar
    let glassesLeftLensLeftVertical = new Cube(glassesColor);
    glassesLeftLensLeftVertical.matrix = new Matrix4(baseHeadMatrix);
    glassesLeftLensLeftVertical.matrix.translate(-0.3, -0.1, -0.256);
    glassesLeftLensLeftVertical.matrix.scale(0.1, 0.2, 0.1);
    glassesLeftLensLeftVertical.render();

    //glasses, left lens, bottom frame
    let glassesRightLensBottomFrame = new Cube(glassesColor);
    glassesRightLensBottomFrame.matrix = new Matrix4(baseHeadMatrix);
    glassesRightLensBottomFrame.matrix.translate(-0.3, 0, -0.255);
    glassesRightLensBottomFrame.matrix.scale(0.1, 0.1, 0.45);
    glassesRightLensBottomFrame.render();

    //glasses, right lens, bottom frame
    let glassesLeftLensBottomFrame = new Cube(glassesColor);
    glassesLeftLensBottomFrame.matrix = new Matrix4(baseHeadMatrix);
    glassesLeftLensBottomFrame.matrix.translate(-0.3, 0, 0.02);
    glassesLeftLensBottomFrame.matrix.scale(0.1, 0.1, 0.46);
    glassesLeftLensBottomFrame.render();


    //beard, top
    let beardTop = new Cube(hairColor);
    beardTop.matrix = new Matrix4(baseHeadMatrix);
    beardTop.matrix.translate(-0.26, 0.1, -0.125);
    beardTop.matrix.scale(0.01, 0.1, 0.5);
    beardTop.render();

    //beard, right
    let beardRight = new Cube(hairColor);
    beardRight.matrix = new Matrix4(baseHeadMatrix);
    beardRight.matrix.translate(-0.26, 0.1, 0.08);
    beardRight.matrix.scale(0.01, 0.3, 0.1);
    beardRight.render();

    //beard, left
    let beardLeft = new Cube(hairColor);
    beardLeft.matrix = new Matrix4(baseHeadMatrix);
    beardLeft.matrix.translate(-0.26, 0.1, -0.15);
    beardLeft.matrix.scale(0.01, 0.3, 0.1);
    beardLeft.render();

    //beard, bottom
    let beardBottom = new Cube(hairColor);
    beardBottom.matrix = new Matrix4(baseHeadMatrix);
    beardBottom.matrix.translate(-0.26, 0.2, -0.125);
    beardBottom.matrix.scale(0.01, 0.1, 0.5);
    beardBottom.render();
    
    // #endregion
    

    //#region TORSO----------------------------------------------------------------------
    //HEV suit center, where the lambda symbol goes
    let baseTorsoMatrix;
    let torsoBase = new Cube(hevGray);
    torsoBase.matrix = new Matrix4();
    torsoBase.matrix.setTranslate(-0.32, 0.1, -0.23); //x -0.3 -> -0.33
    baseTorsoMatrix = new Matrix4(torsoBase.matrix);
    torsoBase.matrix.scale(0.5, 0.25, 0.54); //0.5 -> 0.54
    torsoBase.render();

    //gray cube underneath lambda symbol
    let upperAbdomen = new Cube(hevGray);
    upperAbdomen.matrix = new Matrix4(baseTorsoMatrix);
    upperAbdomen.matrix.translate(0.023, -0.05, 0.027);
    upperAbdomen.matrix.scale(0.4, 0.15, 0.44);
    upperAbdomen.render();

    //upper black line
    let upperAbdomenBoundary = new Cube(glassesColor);
    upperAbdomenBoundary.matrix = new Matrix4(baseTorsoMatrix);
    upperAbdomenBoundary.matrix.translate(0.023, -0.06, 0.025);
    upperAbdomenBoundary.matrix.scale(0.4, 0.01, 0.44);
    upperAbdomenBoundary.render();

    //black box around stomach
    let abdomen = new Cube(hevGray);
    abdomen.matrix = new Matrix4(baseTorsoMatrix);
    abdomen.matrix.translate(0.023, -0.14, 0.025);
    abdomen.matrix.scale(0.4, 0.15, 0.44);
    abdomen.render();

    //lower black line
    let lowerAbdomenBoundary = new Cube(glassesColor);
    lowerAbdomenBoundary.matrix = new Matrix4(baseTorsoMatrix);
    lowerAbdomenBoundary.matrix.translate(0.023, -0.1505, 0.025);
    lowerAbdomenBoundary.matrix.scale(0.4, 0.01, 0.44);
    lowerAbdomenBoundary.render();

    //waistline cube
    let lowerAbdomen = new Cube(hevGray);
    lowerAbdomen.matrix = new Matrix4(baseTorsoMatrix);
    lowerAbdomen.matrix.translate(0.023, -0.205, 0.025);
    lowerAbdomen.matrix.scale(0.4, 0.1, 0.44);
    lowerAbdomen.render();


    //orange detailing on suit
    //orange square for lambda symbol
    let lambdaBase = new Cube(hevOrange);
    lambdaBase.matrix = new Matrix4(baseTorsoMatrix);
    lambdaBase.matrix.scale(0.01, 0.25, 0.25);
    lambdaBase.matrix.translate(25, 0, 0.3);
    lambdaBase.render();

    let lambda = new Lambda(lambdaColor);
    lambda.matrix = new Matrix4(baseTorsoMatrix);
    lambda.matrix.translate(0.257, 0.065, 0.14);
    lambda.matrix.rotate(-90, 0, 1, 0);
    lambda.matrix.scale(0.05, 0.05, 0.05);

    lambda.render();

    //orange strip on left side
    let leftRibCage = new Cube(hevOrange);
    leftRibCage.matrix = new Matrix4(baseTorsoMatrix);
    leftRibCage.matrix.translate(0.019, -0.05, 0.249);
    leftRibCage.matrix.scale(0.44, 0.1, 0.01);
    leftRibCage.render();

    //orange strip on right side
    let rightRibCage = new Cube(hevOrange);
    rightRibCage.matrix = new Matrix4(baseTorsoMatrix);
    rightRibCage.matrix.translate(0.019, -0.05, 0.02);
    rightRibCage.matrix.scale(0.44, 0.1, 0.01);
    rightRibCage.render();

    //orange square, lower left side
    let orangeSquareLeft = new Cube(hevOrange);
    orangeSquareLeft.matrix = new Matrix4(baseTorsoMatrix);
    orangeSquareLeft.matrix.translate(0.235, -0.05, 0.185);
    orangeSquareLeft.matrix.scale(0.01, 0.09, 0.13);
    orangeSquareLeft.render();

    //orange square, lower right side
    let orangeSquareRight = new Cube(hevOrange);
    orangeSquareRight.matrix = new Matrix4(baseTorsoMatrix);
    orangeSquareRight.matrix.translate(0.235, -0.05, 0.025);
    orangeSquareRight.matrix.scale(0.01, 0.09, 0.13);
    orangeSquareRight.render();

    //horizontal orange strip, back side
    let orangeStripLowerBack = new Cube(hevOrange);
    orangeStripLowerBack.matrix = new Matrix4(baseTorsoMatrix);
    orangeStripLowerBack.matrix.translate(0.02, -0.048, 0.025);
    orangeStripLowerBack.matrix.scale(0.01, 0.09, 0.45);
    orangeStripLowerBack.render();

    //vertical strip on back side, left
    let orangeStripVerticalBackLeft = new Cube(hevOrange);
    orangeStripVerticalBackLeft.matrix = new Matrix4(baseTorsoMatrix);
    orangeStripVerticalBackLeft.matrix.translate(-0.001, -0.01, 0.055);
    orangeStripVerticalBackLeft.matrix.scale(0.01, 0.26, 0.3);
    orangeStripVerticalBackLeft.render();

    // //vertical strip on back side, right
    // let orangeStripVerticalBackRight = new Cube(hevOrange);
    // orangeStripVerticalBackRight.matrix = new Matrix4(baseTorsoMatrix);
    // orangeStripVerticalBackRight.matrix.translate(-0.001, -0.01, 0.075);
    // orangeStripVerticalBackRight.matrix.scale(0.01, 0.26, 0.1);
    // orangeStripVerticalBackRight.render();

    //orange strip around waist
    //orange belt, front left
    let orangeBeltFrontLeft = new Cube(hevOrange);
    orangeBeltFrontLeft.matrix = new Matrix4(baseTorsoMatrix);
    orangeBeltFrontLeft.matrix.translate(0.22, -0.205, 0.159);
    orangeBeltFrontLeft.matrix.scale(0.01, 0.1, 0.17);
    orangeBeltFrontLeft.render();

    //orange belt, front right
    let orangeBeltFrontRight = new Cube(hevOrange);
    orangeBeltFrontRight.matrix = new Matrix4(baseTorsoMatrix);
    orangeBeltFrontRight.matrix.translate(0.22, -0.205, 0.02);
    orangeBeltFrontRight.matrix.scale(0.01, 0.1, 0.17);
    orangeBeltFrontRight.render();

    //orange belt, left side
    let orangeBeltLeftSide = new Cube(hevOrange);
    orangeBeltLeftSide.matrix = new Matrix4(baseTorsoMatrix);
    orangeBeltLeftSide.matrix.translate(0.02, -0.205, 0.245);
    orangeBeltLeftSide.matrix.scale(0.41, 0.1, 0.01);
    orangeBeltLeftSide.render();

    //orange belt, right side
    let orangeBeltRightSide = new Cube(hevOrange);
    orangeBeltRightSide.matrix = new Matrix4(baseTorsoMatrix);
    orangeBeltRightSide.matrix.translate(0.02, -0.205, 0.0245);
    orangeBeltRightSide.matrix.scale(0.41, 0.1, 0.01);
    orangeBeltRightSide.render();

    //orange belt, back side
    let orangeBeltBackSide = new Cube(hevOrange);
    orangeBeltBackSide.matrix = new Matrix4(baseTorsoMatrix);
    orangeBeltBackSide.matrix.translate(0.02, -0.205, 0.025);
    orangeBeltBackSide.matrix.scale(0.01, 0.1, 0.45);
    orangeBeltBackSide.render();
    //#endregion
    
    
    //#region LEFT LEG-------------------------------------------------------------------
    //gray part between waist and orange hip
    let baseLeftLegMatrix;
    let leftHipJoint = new Cube(hevGray);
    leftHipJoint.matrix = new Matrix4();
    leftHipJoint.matrix.translate(-0.135, -0.105, 0.02);
    leftHipJoint.matrix.scale(-1, -1, -1);
    leftHipJoint.matrix.rotate(0, 0, 1, 0);
    leftHipJoint.matrix.rotate(leftLegRotation[0], 0, 0, 1); //--> set leg rotation
    baseLeftLegMatrix = new Matrix4(leftHipJoint.matrix);
    leftHipJoint.matrix.scale(0.25, 0.1, 0.2)
    leftHipJoint.render();

    let leftLegBase = new Cube(hevOrange);
    leftLegBase.matrix = new Matrix4(baseLeftLegMatrix);
    leftLegBase.matrix.translate(0, 0.05, 0);
    leftLegBase.matrix.scale(0.25, 0.3, 0.2);
    leftLegBase.render();

    let leftKnee = new Cube(hevGray);
    let leftKneeBaseMatrix;
    leftKnee.matrix = new Matrix4(baseLeftLegMatrix);
    leftKnee.matrix.translate(0.125, 0.2, 0);
    leftKnee.matrix.rotate(90, 0, 0, 1);
    leftKneeBaseMatrix = new Matrix4(leftKnee.matrix);
    leftKnee.matrix.scale(0.2, 0.25, 0.2);
    leftKnee.matrix.rotate(leftLegRotation[1], 0, 0, 1); //----> rotates knee
    leftKnee.render();

    //left shin/boot
    let leftShin = new Cube(bootsColor);
    leftShin.matrix = new Matrix4(leftKnee.matrix); //this hsould be leftKneeBaseMatrix, but after fixing 5000 different cube positions, idc anymore
    leftShin.matrix.translate(0.5, 0.01, 0.02);
    leftShin.matrix.scale(1.2, 0.9, 0.9);
    leftShin.render();

    let leftBoot = new Cube(bootsColor);
    leftBoot.matrix = new Matrix4(leftKnee.matrix);
    leftBoot.matrix.translate(1.1, 0.01, 0.02);
    leftBoot.matrix.scale(0.7, 1.3, 0.9)
    leftBoot.render();

    //#endregion


    //#region RIGHT LEG-----------------------------------------------------------------
    //gray part between waist and orange hip
    let baseRightLegMatrix;
    let rightHipJoint = new Cube(hevGray);
    rightHipJoint.matrix = new Matrix4();
    rightHipJoint.matrix.translate(-0.135, -0.107, -0.109);
    rightHipJoint.matrix.scale(-1, -1, -1);
    rightHipJoint.matrix.rotate(0, 0, 1, 0);
    rightHipJoint.matrix.rotate(rightLegRotation[0], 0, 0, 1); //set leg rotation
    baseRightLegMatrix = new Matrix4(rightHipJoint.matrix);
    rightHipJoint.matrix.scale(0.25, 0.1, 0.2)
    rightHipJoint.render();

    let rightLegBase = new Cube(hevOrange2);
    rightLegBase.matrix = new Matrix4(baseRightLegMatrix);
    rightLegBase.matrix.translate(0, 0.05, 0);
    rightLegBase.matrix.scale(0.25, 0.3, 0.2);
    rightLegBase.render();

    //right knee
    let rightKnee = new Cube(hevGray);
    let rightKneeBaseMatrix;
    rightKnee.matrix = new Matrix4(baseRightLegMatrix);
    rightKnee.matrix.translate(0.125, 0.2, 0);
    rightKnee.matrix.rotate(90, 0, 0, 1);
    rightKneeBaseMatrix = new Matrix4(rightKnee.matrix);
    rightKnee.matrix.scale(0.2, 0.25, 0.2);
    rightKnee.matrix.rotate(rightLegRotation[1], 0, 0, 1); //----> rotates knee
    rightKnee.render();

    //right shin/boot
    let rightShin = new Cube(bootsColor);
    rightShin.matrix = new Matrix4(rightKnee.matrix);
    rightShin.matrix.translate(0.5, 0.01, 0.02);
    rightShin.matrix.scale(1.2, 0.9, 0.9);
    rightShin.render();

    let rightBoot = new Cube(bootsColor);
    rightBoot.matrix = new Matrix4(rightKnee.matrix);
    rightBoot.matrix.translate(1.1, 0.01, 0.02);
    rightBoot.matrix.scale(0.7, 1.3, 0.9)
    rightBoot.render();

    //#endregion


    //#region LEFT ARM-------------------------------------------------------------------
    //left shoulder pad
    let leftShoulderPad = new Cube2(hevGray);
    let baseLeftShoulderMatrix;
    leftShoulderPad.matrix = new Matrix4();
    leftShoulderPad.matrix.setTranslate(-0.2, 0.16, 0.102);
    leftShoulderPad.matrix.rotate(leftArmRotation[0], 0, 0, 1); //--> rotates arm
    baseLeftShoulderMatrix = new Matrix4(leftShoulderPad.matrix);
    leftShoulderPad.matrix.scale(0.25, 0.2, 0.25);
    leftShoulderPad.render(); 

    let upperArmLeft = new Cube(hevArmColor);
    upperArmLeft.matrix = new Matrix4(baseLeftShoulderMatrix);
    upperArmLeft.matrix.translate(-0.05, -0.15, -0.05);
    upperArmLeft.matrix.scale(0.21, 0.2, 0.21);
    upperArmLeft.render();

    let leftElbow = new Cube(hevGray);
    let leftElbowBaseMatrix;
    leftElbow.matrix = new Matrix4(baseLeftShoulderMatrix);
    leftElbow.matrix.translate(0.06, -0.15, 0.05);
    leftElbow.matrix.rotate(180, 1, 0, 0);
    leftElbow.matrix.rotate(90, 0, 0, 1);
    leftElbow.matrix.rotate(leftArmRotation[1], 0, 0, 1); //rotates elbow
    leftElbowBaseMatrix = new Matrix4(leftElbow.matrix);
    leftElbow.matrix.scale(0.125, 0.2, 0.2);
    leftElbow.render();

    let leftForeArm = new Cube(hevArmColor);
    leftForeArm.matrix = new Matrix4(leftElbowBaseMatrix);
    leftForeArm.matrix.translate(0.062, 0.005, 0.007);
    leftForeArm.matrix.scale(0.18, 0.17, 0.17);
    leftForeArm.render();

    let leftHand = new Cube2(skinColor);
    let leftHandBaseMatrix;
    leftHand.matrix = new Matrix4(leftElbowBaseMatrix);
    leftHand.matrix.translate(0.19, 0.0476, 0.05);
    leftHand.matrix.rotate(leftArmRotation[2], 1, 0, 0); //rotates hand
    leftHand.matrix.scale(0.17, 0.17, 0.17);
    leftHand.render();
    //#endregion


    //#region RIGHT ARM--------------------------------------------------------------------
    //right shoulder pad
    let rightShoulderPad = new Cube2(hevGray);
    let baseRightShoulderMatrix;
    rightShoulderPad.matrix = new Matrix4();
    rightShoulderPad.matrix.translate(-0.2, 0.16, -0.292);
    rightShoulderPad.matrix.rotate(rightArmRotation[0], 0, 0, 1); //--> rotates arm
    baseRightShoulderMatrix = new Matrix4(rightShoulderPad.matrix);
    rightShoulderPad.matrix.scale(0.25, 0.2, 0.25);
    rightShoulderPad.render()

    let upperArmRight = new Cube(hevArmColor);
    upperArmRight.matrix = new Matrix4(baseRightShoulderMatrix);
    upperArmRight.matrix.translate(-0.05, -0.15, -0.05);
    upperArmRight.matrix.scale(0.21, 0.3, 0.21);
    upperArmRight.render();

    let rightElbow = new Cube(hevElbowColor);
    let rightElbowBaseMatrix;
    rightElbow.matrix = new Matrix4(baseRightShoulderMatrix);
    rightElbow.matrix.translate(0.05, -0.15, 0.055);
    rightElbow.matrix.rotate(180, 1, 0, 0);
    rightElbow.matrix.rotate(90, 0, 0, 1);
    rightElbow.matrix.rotate(rightArmRotation[1], 0, 0, 1); //rotates elbow
    rightElbowBaseMatrix = new Matrix4(rightElbow.matrix);
    rightElbow.matrix.scale(0.125, 0.2, 0.2);
    rightElbow.render();

    let rightForeArm = new Cube(hevArmColor);
    rightForeArm.matrix = new Matrix4(rightElbowBaseMatrix);
    rightForeArm.matrix.translate(0.062, 0.005, 0.007);
    rightForeArm.matrix.scale(0.18, 0.17, 0.17);
    rightForeArm.render();

    let rightHand = new Cube2(skinColor);
    let rightHandBaseMatrix;
    rightHand.matrix = new Matrix4(rightElbowBaseMatrix);
    rightHand.matrix.translate(0.19, 0.0476, 0.05);//
    rightHand.matrix.rotate(rightArmRotation[2], 1, 0, 0); //rotates hand
    rightHandBaseMatrix = new Matrix4(rightHand.matrix);
    rightHand.matrix.scale(0.17, 0.17, 0.17);
    rightHand.render();

    //crowbar-------------
    let crowbarHandle = new Cube(crowbarHandleColor);
    crowbarHandle.matrix = new Matrix4(rightHandBaseMatrix);
    crowbarHandle.matrix.translate(0, -0.4, -0.02);
    crowbarHandle.matrix.scale(0.05, 1, 0.05);
    crowbarHandle.render();

    let crowbarPiece1 = new Cube(crowbarCrookColor);
    crowbarPiece1.matrix = new Matrix4(rightHandBaseMatrix);
    crowbarPiece1.matrix.translate(0.01, -0.399, -0.019);
    crowbarPiece1.matrix.scale(0.15, 0.05, 0.05);
    crowbarPiece1.render();

    let crowbarPiece2 = new Cube(crowbarCrookColor);
    crowbarPiece2.matrix = new Matrix4(rightHandBaseMatrix);
    crowbarPiece2.matrix.translate(0.09, -0.399, -0.019);
    crowbarPiece2.matrix.rotate(45, 0, 0, 1);
    crowbarPiece2.matrix.scale(0.23, 0.05, 0.05);
    crowbarPiece2.render();
    //#endregion
}

// function reset(axis) {
//     document.getElementById(`whereSlider${axis}`).value = 0;
//     renderAllShapes();
// }

// function setView(axis, angle) {
//     document.getElementById(`${axis}Slider`).value = angle;
//     document.getElementById("xSlider").value = 0;
//     renderAllShapes();
// }

function rotateBodyPart(part, angle) {
    switch (part) {
        case "x_head":
            headRotation[0] = angle;
            break;
        case "y_head":
            headRotation[1] = angle;
            break;   
        case "z_head":
            headRotation[2] = angle;
            break; 
        case "left_shoulder":
            leftArmRotation[0] = angle;
            break;
        case "left_elbow":
            leftArmRotation[1] = 0 - angle;
            break;
        case "left_hand":
            leftArmRotation[2] = angle - 90;
            break;
        case "right_shoulder":
            rightArmRotation[0] = angle;
            break;
        case "right_elbow":
            rightArmRotation[1] = 0 - angle;
            break;
        case "right_hand":
            rightArmRotation[2] = 0 - angle;
            break;
        case "left_hip":
            leftLegRotation[0] = angle - 20;
            break;
        case "left_knee":
            leftLegRotation[1] = 360 - angle;
            break;
        case "right_hip":
            rightLegRotation[0] = angle - 20;
            break;
        case "right_knee":
            rightLegRotation[1] = 360 - angle;
            break;            
    }

    renderAllShapes();
}

function resetSlider(name) {
    let angle = 0;
    switch (name) {
        case "xSlider":
            xSlider.value = 21;
            angle = 21;
            break;
        case "ySlider":
            ySlider.value = 125;
            angle = 125;
            break;
        case "left_hip":
            document.getElementById("left_hip").value = 20;
            angle = 20;
            break;
        case "right_hip":
            document.getElementById("right_hip").value = 20;
            angle = 20;
            break;
        default:
            document.getElementById(name).value = 0;
            break;
    }

    rotateBodyPart(name, angle);
}

function sigmoid(x) {
    let exponent = -((x - 0.3) / 0.1);
    return 1 / (1 + Math.exp(exponent));
}

function sigmoid2(x) {
    return Math.sin(1.5 * x);
}

function sigmoid3(x) {
    return 1 - 1 / (Math.pow(x + 1, 8));
}

let lastTimeStamp = 0;
let totalTime = 0;

function beginAnimation(time, name) {
    lastTimeStamp = time;
    totalTime = 0;
    if (name == "crowbar") {
        crowbarButton.disabled = true;
        animationRequestID = requestAnimationFrame(crowbarHit);
    } else
        animationRequestID = requestAnimationFrame(walkAnimation);
}

function crowbarHit(time) {
    let deltaTime = time - lastTimeStamp;
    lastTimeStamp = time;
    totalTime += deltaTime;

    //shoulder: 0 -> 154
    //elbow: 0 -> -90
    let startTick = 0;
    let endTick = startTick + 1040;
    if (totalTime >= startTick && totalTime <= endTick) {
        let t = (totalTime - startTick) / (endTick - startTick);
        let s = sigmoid3(t);
        rightArmRotation[0] = rShoulderSlider.value = s * 154;
        rightArmRotation[1] = s * -90;
        rElbowSlider.value = Math.abs(rightArmRotation[1]);
    }

    //do nothing for like 200ms
    startTick = endTick - 200; //why will it only work if i start the animation *before* the previous one finishes?????????
    endTick = startTick + 200;

    //shoulder: 154 -> 77
    //elbow: -90 -> 0
    if (totalTime >= startTick && totalTime <= endTick) {
        let t = (totalTime - startTick) / (endTick - startTick);
        let s = sigmoid3(t);
        rightArmRotation[0] = rShoulderSlider.value = 77 * s + (154 * (1 - s));
        rightArmRotation[1] = rElbowSlider.value = -90 * (1 - s);
    }

    //because this might never actually equal endTick
    let range = 30;
    let soundTick = endTick - 350;
    if (totalTime > soundTick - 30 && totalTime < soundTick + 30) {
        audio.play();
    }

    startTick = soundTick + range + 1000;
    endTick = startTick + 680; 
    if (totalTime >= startTick && totalTime <= endTick) {
        rightArmRotation[1] = rElbowSlider.value = 0;

        let t = (totalTime - startTick) / (endTick - startTick);
        let s = sigmoid2(t);
        rightArmRotation[0] = rShoulderSlider.value = (77 * (1 - s));
    }


    renderAllShapes();
    if (totalTime > 2800) {
        crowbarButton.disabled = false;
        return;
    }

    animationRequestID = requestAnimationFrame(crowbarHit);
}

function walkAnimation(time) {
    let deltaTime = time - lastTimeStamp;
    lastTimeStamp = time;
    totalTime += deltaTime;

    let t = (Math.sin((totalTime / 150) / 2) + 1) / 2;

    //left leg: 20 to -27
    //right leg: -27 to 20    
    const legMin = 25;
    const legMax = -20;
    leftLegRotation[0] = lHipSlider.value = legMin * t + legMax * (1 - t);
    rightLegRotation[0] = rHipSlider.value = legMax * t + legMin * (1 - t);

    // left knee: 360 to 317
    // right knee: 317 to 360
    const kneeMax = 317;
    const kneeMin = 360;
    leftLegRotation[1] = lKneeSlider.value = kneeMin * t + kneeMax * (1 - t);
    rightLegRotation[1] = rKneeSlider.value = kneeMax * t + kneeMin * (1 - t);

    //left shoulder: -23 to 12
    //right shoulder: 12 to -23 (opposite of left/right legs)
    const shoulderMin = -23;
    const shoulderMax = 12;
    leftArmRotation[0] = lShoulderSlider.value = shoulderMin * t + shoulderMax * (1 - t);
    rightArmRotation[0] = rShoulderSlider.value = shoulderMax * t + shoulderMin * (1 - t);

    //left elbow: 0 to -20
    //right elbow: -20 to 0
    const elbowMin = 0;
    const elbowMax = -20;
    leftArmRotation[1] = lElbowSlider.value = elbowMin * t + elbowMax * (1 - t);
    rightArmRotation[1] = rElbowSlider.value = elbowMax * t + elbowMin * (1 - t);

    renderAllShapes();
    animationRequestID = requestAnimationFrame(walkAnimation);
}

function OnAnimationSelect() {
    let choice = animationSelector.value;
    if (choice == "none") {
        crowbarButton.disabled = false;
        cancelAnimationFrame(animationRequestID);
        resetAll();
    } else {
        animationRequestID = requestAnimationFrame(function(time) {
            beginAnimation(time, 'walk')
        });
        crowbarButton.disabled = true;

    }
}

function resetAll() {
    const sliderNames = ["x_head", "y_head", "z_head", "left_shoulder", "left_elbow", "left_hand", "right_shoulder", "right_elbow", "right_hand", "xSlider", "ySlider", "zSlider", "left_hip", "left_knee", "right_hip", "right_knee"];
    for (let i = 0; i < sliderNames.length; i++) {
        resetSlider(sliderNames[i]);
    }
}