"use strict";
//from https://github.com/jwagner/simplex-noise.js

/*
 * A fast javascript implementation of simplex noise by Jonas Wagner

Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
Better rank ordering method by Stefan Gustavson in 2012.

 Copyright (c) 2022 Jonas Wagner

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPermutationTable = exports.createNoise4D = exports.createNoise3D = exports.createNoise2D = void 0;
// these #__PURE__ comments help uglifyjs with dead code removal
// 
var F2 = /*#__PURE__*/ 0.5 * (Math.sqrt(3.0) - 1.0);
var G2 = /*#__PURE__*/ (3.0 - Math.sqrt(3.0)) / 6.0;
var F3 = 1.0 / 3.0;
var G3 = 1.0 / 6.0;
var F4 = /*#__PURE__*/ (Math.sqrt(5.0) - 1.0) / 4.0;
var G4 = /*#__PURE__*/ (5.0 - Math.sqrt(5.0)) / 20.0;
// I'm really not sure why this | 0 (basically a coercion to int)
// is making this faster but I get ~5 million ops/sec more on the
// benchmarks across the board or a ~10% speedup.
var fastFloor = function (x) { return Math.floor(x) | 0; };
var grad2 = /*#__PURE__*/ new Float64Array([1, 1,
    -1, 1,
    1, -1,
    -1, -1,
    1, 0,
    -1, 0,
    1, 0,
    -1, 0,
    0, 1,
    0, -1,
    0, 1,
    0, -1]);
// double seems to be faster than single or int's
// probably because most operations are in double precision
var grad3 = /*#__PURE__*/ new Float64Array([1, 1, 0,
    -1, 1, 0,
    1, -1, 0,
    -1, -1, 0,
    1, 0, 1,
    -1, 0, 1,
    1, 0, -1,
    -1, 0, -1,
    0, 1, 1,
    0, -1, 1,
    0, 1, -1,
    0, -1, -1]);
// double is a bit quicker here as well
var grad4 = /*#__PURE__*/ new Float64Array([0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1,
    0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1,
    1, 0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1, 0, -1, -1,
    -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1,
    1, 1, 0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1,
    -1, 1, 0, 1, -1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, -1,
    1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0,
    -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0]);
/**
 * Creates a 2D noise function
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseFunction2D}
 */
export function createNoise2D(random) {
    if (random === void 0) { random = Math.random; }
    var perm = buildPermutationTable(random);
    // precalculating this yields a little ~3% performance improvement.
    var permGrad2x = new Float64Array(perm).map(function (v) { return grad2[(v % 12) * 2]; });
    var permGrad2y = new Float64Array(perm).map(function (v) { return grad2[(v % 12) * 2 + 1]; });
    return function noise2D(x, y) {
        // if(!isFinite(x) || !isFinite(y)) return 0;
        var n0 = 0; // Noise contributions from the three corners
        var n1 = 0;
        var n2 = 0;
        // Skew the input space to determine which simplex cell we're in
        var s = (x + y) * F2; // Hairy factor for 2D
        var i = fastFloor(x + s);
        var j = fastFloor(y + s);
        var t = (i + j) * G2;
        var X0 = i - t; // Unskew the cell origin back to (x,y) space
        var Y0 = j - t;
        var x0 = x - X0; // The x,y distances from the cell origin
        var y0 = y - Y0;
        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
        else {
            i1 = 0;
            j1 = 1;
        } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
        var y2 = y0 - 1.0 + 2.0 * G2;
        // Work out the hashed gradient indices of the three simplex corners
        var ii = i & 255;
        var jj = j & 255;
        // Calculate the contribution from the three corners
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            var gi0 = ii + perm[jj];
            var g0x = permGrad2x[gi0];
            var g0y = permGrad2y[gi0];
            t0 *= t0;
            // n0 = t0 * t0 * (grad2[gi0] * x0 + grad2[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
            n0 = t0 * t0 * (g0x * x0 + g0y * y0);
        }
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            var gi1 = ii + i1 + perm[jj + j1];
            var g1x = permGrad2x[gi1];
            var g1y = permGrad2y[gi1];
            t1 *= t1;
            // n1 = t1 * t1 * (grad2[gi1] * x1 + grad2[gi1 + 1] * y1);
            n1 = t1 * t1 * (g1x * x1 + g1y * y1);
        }
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            var gi2 = ii + 1 + perm[jj + 1];
            var g2x = permGrad2x[gi2];
            var g2y = permGrad2y[gi2];
            t2 *= t2;
            // n2 = t2 * t2 * (grad2[gi2] * x2 + grad2[gi2 + 1] * y2);
            n2 = t2 * t2 * (g2x * x2 + g2y * y2);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 70.0 * (n0 + n1 + n2);
    };
}
exports.createNoise2D = createNoise2D;
/**
 * Creates a 3D noise function
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseFunction3D}
 */
export function createNoise3D(random) {
    if (random === void 0) { random = Math.random; }
    var perm = buildPermutationTable(random);
    // precalculating these seems to yield a speedup of over 15%
    var permGrad3x = new Float64Array(perm).map(function (v) { return grad3[(v % 12) * 3]; });
    var permGrad3y = new Float64Array(perm).map(function (v) { return grad3[(v % 12) * 3 + 1]; });
    var permGrad3z = new Float64Array(perm).map(function (v) { return grad3[(v % 12) * 3 + 2]; });
    return function noise3D(x, y, z) {
        var n0, n1, n2, n3; // Noise contributions from the four corners
        // Skew the input space to determine which simplex cell we're in
        var s = (x + y + z) * F3; // Very nice and simple skew factor for 3D
        var i = fastFloor(x + s);
        var j = fastFloor(y + s);
        var k = fastFloor(z + s);
        var t = (i + j + k) * G3;
        var X0 = i - t; // Unskew the cell origin back to (x,y,z) space
        var Y0 = j - t;
        var Z0 = k - t;
        var x0 = x - X0; // The x,y,z distances from the cell origin
        var y0 = y - Y0;
        var z0 = z - Z0;
        // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
        // Determine which simplex we are in.
        var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
        var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
        if (x0 >= y0) {
            if (y0 >= z0) {
                i1 = 1;
                j1 = 0;
                k1 = 0;
                i2 = 1;
                j2 = 1;
                k2 = 0;
            } // X Y Z order
            else if (x0 >= z0) {
                i1 = 1;
                j1 = 0;
                k1 = 0;
                i2 = 1;
                j2 = 0;
                k2 = 1;
            } // X Z Y order
            else {
                i1 = 0;
                j1 = 0;
                k1 = 1;
                i2 = 1;
                j2 = 0;
                k2 = 1;
            } // Z X Y order
        }
        else { // x0<y0
            if (y0 < z0) {
                i1 = 0;
                j1 = 0;
                k1 = 1;
                i2 = 0;
                j2 = 1;
                k2 = 1;
            } // Z Y X order
            else if (x0 < z0) {
                i1 = 0;
                j1 = 1;
                k1 = 0;
                i2 = 0;
                j2 = 1;
                k2 = 1;
            } // Y Z X order
            else {
                i1 = 0;
                j1 = 1;
                k1 = 0;
                i2 = 1;
                j2 = 1;
                k2 = 0;
            } // Y X Z order
        }
        // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
        // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
        // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
        // c = 1/6.
        var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
        var y1 = y0 - j1 + G3;
        var z1 = z0 - k1 + G3;
        var x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
        var y2 = y0 - j2 + 2.0 * G3;
        var z2 = z0 - k2 + 2.0 * G3;
        var x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
        var y3 = y0 - 1.0 + 3.0 * G3;
        var z3 = z0 - 1.0 + 3.0 * G3;
        // Work out the hashed gradient indices of the four simplex corners
        var ii = i & 255;
        var jj = j & 255;
        var kk = k & 255;
        // Calculate the contribution from the four corners
        var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0)
            n0 = 0.0;
        else {
            var gi0 = ii + perm[jj + perm[kk]];
            t0 *= t0;
            n0 = t0 * t0 * (permGrad3x[gi0] * x0 + permGrad3y[gi0] * y0 + permGrad3z[gi0] * z0);
        }
        var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0)
            n1 = 0.0;
        else {
            var gi1 = ii + i1 + perm[jj + j1 + perm[kk + k1]];
            t1 *= t1;
            n1 = t1 * t1 * (permGrad3x[gi1] * x1 + permGrad3y[gi1] * y1 + permGrad3z[gi1] * z1);
        }
        var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0)
            n2 = 0.0;
        else {
            var gi2 = ii + i2 + perm[jj + j2 + perm[kk + k2]];
            t2 *= t2;
            n2 = t2 * t2 * (permGrad3x[gi2] * x2 + permGrad3y[gi2] * y2 + permGrad3z[gi2] * z2);
        }
        var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0)
            n3 = 0.0;
        else {
            var gi3 = ii + 1 + perm[jj + 1 + perm[kk + 1]];
            t3 *= t3;
            n3 = t3 * t3 * (permGrad3x[gi3] * x3 + permGrad3y[gi3] * y3 + permGrad3z[gi3] * z3);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to stay just inside [-1,1]
        return 32.0 * (n0 + n1 + n2 + n3);
    };
}
exports.createNoise3D = createNoise3D;
/**
 * Creates a 4D noise function
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseFunction4D}
 */
function createNoise4D(random) {
    if (random === void 0) { random = Math.random; }
    var perm = buildPermutationTable(random);
    // precalculating these leads to a ~10% speedup
    var permGrad4x = new Float64Array(perm).map(function (v) { return grad4[(v % 32) * 4]; });
    var permGrad4y = new Float64Array(perm).map(function (v) { return grad4[(v % 32) * 4 + 1]; });
    var permGrad4z = new Float64Array(perm).map(function (v) { return grad4[(v % 32) * 4 + 2]; });
    var permGrad4w = new Float64Array(perm).map(function (v) { return grad4[(v % 32) * 4 + 3]; });
    return function noise4D(x, y, z, w) {
        var n0, n1, n2, n3, n4; // Noise contributions from the five corners
        // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
        var s = (x + y + z + w) * F4; // Factor for 4D skewing
        var i = fastFloor(x + s);
        var j = fastFloor(y + s);
        var k = fastFloor(z + s);
        var l = fastFloor(w + s);
        var t = (i + j + k + l) * G4; // Factor for 4D unskewing
        var X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space
        var Y0 = j - t;
        var Z0 = k - t;
        var W0 = l - t;
        var x0 = x - X0; // The x,y,z,w distances from the cell origin
        var y0 = y - Y0;
        var z0 = z - Z0;
        var w0 = w - W0;
        // For the 4D case, the simplex is a 4D shape I won't even try to describe.
        // To find out which of the 24 possible simplices we're in, we need to
        // determine the magnitude ordering of x0, y0, z0 and w0.
        // Six pair-wise comparisons are performed between each possible pair
        // of the four coordinates, and the results are used to rank the numbers.
        var rankx = 0;
        var ranky = 0;
        var rankz = 0;
        var rankw = 0;
        if (x0 > y0)
            rankx++;
        else
            ranky++;
        if (x0 > z0)
            rankx++;
        else
            rankz++;
        if (x0 > w0)
            rankx++;
        else
            rankw++;
        if (y0 > z0)
            ranky++;
        else
            rankz++;
        if (y0 > w0)
            ranky++;
        else
            rankw++;
        if (z0 > w0)
            rankz++;
        else
            rankw++;
        // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
        // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
        // impossible. Only the 24 indices which have non-zero entries make any sense.
        // We use a thresholding to set the coordinates in turn from the largest magnitude.
        // Rank 3 denotes the largest coordinate.
        // Rank 2 denotes the second largest coordinate.
        // Rank 1 denotes the second smallest coordinate.
        // The integer offsets for the second simplex corner
        var i1 = rankx >= 3 ? 1 : 0;
        var j1 = ranky >= 3 ? 1 : 0;
        var k1 = rankz >= 3 ? 1 : 0;
        var l1 = rankw >= 3 ? 1 : 0;
        // The integer offsets for the third simplex corner
        var i2 = rankx >= 2 ? 1 : 0;
        var j2 = ranky >= 2 ? 1 : 0;
        var k2 = rankz >= 2 ? 1 : 0;
        var l2 = rankw >= 2 ? 1 : 0;
        // The integer offsets for the fourth simplex corner
        var i3 = rankx >= 1 ? 1 : 0;
        var j3 = ranky >= 1 ? 1 : 0;
        var k3 = rankz >= 1 ? 1 : 0;
        var l3 = rankw >= 1 ? 1 : 0;
        // The fifth corner has all coordinate offsets = 1, so no need to compute that.
        var x1 = x0 - i1 + G4; // Offsets for second corner in (x,y,z,w) coords
        var y1 = y0 - j1 + G4;
        var z1 = z0 - k1 + G4;
        var w1 = w0 - l1 + G4;
        var x2 = x0 - i2 + 2.0 * G4; // Offsets for third corner in (x,y,z,w) coords
        var y2 = y0 - j2 + 2.0 * G4;
        var z2 = z0 - k2 + 2.0 * G4;
        var w2 = w0 - l2 + 2.0 * G4;
        var x3 = x0 - i3 + 3.0 * G4; // Offsets for fourth corner in (x,y,z,w) coords
        var y3 = y0 - j3 + 3.0 * G4;
        var z3 = z0 - k3 + 3.0 * G4;
        var w3 = w0 - l3 + 3.0 * G4;
        var x4 = x0 - 1.0 + 4.0 * G4; // Offsets for last corner in (x,y,z,w) coords
        var y4 = y0 - 1.0 + 4.0 * G4;
        var z4 = z0 - 1.0 + 4.0 * G4;
        var w4 = w0 - 1.0 + 4.0 * G4;
        // Work out the hashed gradient indices of the five simplex corners
        var ii = i & 255;
        var jj = j & 255;
        var kk = k & 255;
        var ll = l & 255;
        // Calculate the contribution from the five corners
        var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
        if (t0 < 0)
            n0 = 0.0;
        else {
            var gi0 = ii + perm[jj + perm[kk + perm[ll]]];
            t0 *= t0;
            n0 = t0 * t0 * (permGrad4x[gi0] * x0 + permGrad4y[gi0] * y0 + permGrad4z[gi0] * z0 + permGrad4w[gi0] * w0);
        }
        var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
        if (t1 < 0)
            n1 = 0.0;
        else {
            var gi1 = ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]];
            t1 *= t1;
            n1 = t1 * t1 * (permGrad4x[gi1] * x1 + permGrad4y[gi1] * y1 + permGrad4z[gi1] * z1 + permGrad4w[gi1] * w1);
        }
        var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
        if (t2 < 0)
            n2 = 0.0;
        else {
            var gi2 = ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]];
            t2 *= t2;
            n2 = t2 * t2 * (permGrad4x[gi2] * x2 + permGrad4y[gi2] * y2 + permGrad4z[gi2] * z2 + permGrad4w[gi2] * w2);
        }
        var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
        if (t3 < 0)
            n3 = 0.0;
        else {
            var gi3 = ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]];
            t3 *= t3;
            n3 = t3 * t3 * (permGrad4x[gi3] * x3 + permGrad4y[gi3] * y3 + permGrad4z[gi3] * z3 + permGrad4w[gi3] * w3);
        }
        var t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
        if (t4 < 0)
            n4 = 0.0;
        else {
            var gi4 = ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]];
            t4 *= t4;
            n4 = t4 * t4 * (permGrad4x[gi4] * x4 + permGrad4y[gi4] * y4 + permGrad4z[gi4] * z4 + permGrad4w[gi4] * w4);
        }
        // Sum up and scale the result to cover the range [-1,1]
        return 27.0 * (n0 + n1 + n2 + n3 + n4);
    };
}
exports.createNoise4D = createNoise4D;
/**
 * Builds a random permutation table.
 * This is exported only for (internal) testing purposes.
 * Do not rely on this export.
 * @private
 */
function buildPermutationTable(random) {
    var tableSize = 512;
    var p = new Uint8Array(tableSize);
    for (var i = 0; i < tableSize / 2; i++) {
        p[i] = i;
    }
    for (var i = 0; i < tableSize / 2 - 1; i++) {
        var r = i + ~~(random() * (256 - i));
        var aux = p[i];
        p[i] = p[r];
        p[r] = aux;
    }
    for (var i = 256; i < tableSize; i++) {
        p[i] = p[i - 256];
    }
    return p;
}
exports.buildPermutationTable = buildPermutationTable;
