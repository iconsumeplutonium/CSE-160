function showDrawing() {
    if (!checkbox.checked)
        return;

    let size = document.getElementById("shapeSizeSlider").value;

    //undercarriage
    pushGray([1, 8, 2], size);
    pushGray([8, 2, 6], size);
    pushGray([2, 4, 5], size);
    pushGray([2, 5, 3], size);
    

    //rear thruster
    pushGray([8, 7, 9], size);
    pushGray([11, 9, 10], size);
    pushGray([12, 8, 11], size);
    pushGray([11, 8, 9], size);
    pushGray([13, 12, 11], size);
    pushGray([14, 12, 13], size);

    //trench
    pushBlack([0, 1, 8], size);
    pushBlack([0, 8, 12], size);

    //stuff above trench
    pushGray([40, 0, 12], size);
    pushGray([39, 40, 38], size);
    pushGray([37, 38, 36], size);
    pushGray([40, 12, 14], size);
    pushGray([38, 40, 14], size);
    pushGray([36, 38, 14], size);
    pushGray([36, 14, 15], size);
    pushGray([35, 36, 15], size);
    pushGray([35, 15, 16], size);
    pushGray([34, 35, 33], size);
    pushGray([33, 35, 16], size);
    pushGray([32, 33, 31], size);
    pushGray([32, 33, 31], size);
    pushGray([31, 33, 16], size);
    pushGray([30, 31, 16], size);

    //bridge superstructure
    pushGray([17, 30, 16], size);
    pushGray([18, 30, 17], size);
    pushGray([18, 29, 30], size);
    pushGray([18, 28, 29], size);
    pushGray([19, 28, 18], size);
    pushGray([20, 28, 19], size);
    pushGray([20, 27, 28], size);
    pushGray([20, 26, 27], size);
    pushGray([20, 25, 26], size);
    pushGray([20, 22, 25], size);
    pushGray([21, 22, 20], size);
    pushGray([23, 25, 22], size);
    pushGray([23, 24, 25], size);
    


    renderAllShapes();
}


//js doesnt have C-like macros, so a dedicated function must do
function pushGray(v, size) {
    g_shapes.push(new ScaleneTriangle(v, [0.66, 0.65, 0.6509, 1], size));
}

function pushBlack(v, size) {
    g_shapes.push(new ScaleneTriangle(v, [0.101, 0.101, 0.101, 1], size));
}



//painstakingly copied from the graph i made
https://www.desmos.com/calculator/tfigyrkjb3
coordinates = [
    [-0.914, 0.021],
    [-0.9136, -0.0038],
    [0.3347, -0.0726],
    [0.463, -0.0794],
    [0.3627, -0.085],
    [0.428, -0.09],
    [0.888, -0.093],
    [0.8177, -0.0576],
    [0.792, -0.043],
    [0.8295, -0.0515],
    [0.8832, -0.0565],
    [0.896, -0.0137],
    [0.7875, -0.0224],
    [0.8832, 0.0343],
    [0.8394, 0.0345],
    [0.8935, 0.108],
    [0.8938, 0.129],
    [0.754, 0.2478],
    [0.6796, 0.2452],
    [0.6669, 0.2583],
    [0.6198, 0.2586],
    [0.6148, 0.2751],
    [0.5842, 0.2749],
    [0.5644, 0.2785],
    [0.5414, 0.2694],
    [0.5498, 0.2554],
    [0.5297, 0.2428],
    [0.5282, 0.2197],
    [0.5524, 0.1976],
    [0.5934, 0.1979],
    [0.6023, 0.1908],
    [0.592, 0.1805],
    [0.3283, 0.1645],
    [0.3142, 0.1546],
    [0.2231, 0.1495],
    [0.19, 0.1253],
    [0.19, 0.1108],
    [0.0499, 0.0953],
    [0.0499, 0.0829],
    [-0.0332, 0.0771],
    [-0.042, 0.0669]
]