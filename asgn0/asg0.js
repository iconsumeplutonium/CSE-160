let ctx;
let v1, v2;

function main() {
    let canvas = document.getElementById("myCanvas");
    if (!canvas) {
        console.log("Error creating canvas.");
        return;
    }

    ctx = canvas.getContext("2d");
    refreshCanvas();
}

function refreshCanvas() {
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, 400, 400);
}

function drawVector(v, color) {
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.lineTo(v.elements[0] * 20 + 200, 200 - v.elements[1] * 20, 0);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function handleDrawEvent() {
    refreshCanvas();
    v1 = new Vector3([document.getElementById("v1X").value, document.getElementById("v1Y").value, 0]);
    v2 = new Vector3([document.getElementById("v2X").value, document.getElementById("v2Y").value, 0]);
    drawVector(v1, "red");
    drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
    handleDrawEvent();
    let op = document.getElementById("operation").value;
    let scalar = document.getElementById("scalar").value;
    switch (op) {
        case "add":
            drawVector(v1.add(v2), "green");
            break;
        case "sub":
            drawVector(v1.sub(v2), "green");
            break;
        case "mul":
            drawVector(v1.mul(scalar), "green");
            drawVector(v2.mul(scalar), "green");
            break;
        case "div":
            drawVector(v1.div(scalar), "green");
            drawVector(v2.div(scalar), "green");
            break;
        case "mag":
            console.log("Magnitude v1: " + v1.magnitude());
            console.log("Magnitude v2: " + v2.magnitude());
            break;
        case "norm":
            drawVector(v1.normalize(), "green");
            drawVector(v2.normalize(), "green");
            break;
        case "dot":
            angleBetween(v1, v2);
            break;
        case "cross":
            areaTriangle(v1, v2);
            break;
    }
}

function angleBetween(v1, v2) {
    let angle = Math.acos(Vector3.dot(v1, v2) / (v1.magnitude() * v2.magnitude()));
    let degrees = (angle * 180) / Math.PI;
    console.log("Angle: " + degrees);
}

function areaTriangle(v1, v2) {
    console.log("Area of the trangle: " + Vector3.cross(v1, v2).magnitude() / 2);
}