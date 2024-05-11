//the bottom left corner of the texture in the texture atlas
const DIRT        = new Vector3([0,     0]);
const GRASS_SIDE  = new Vector3([0.25,  0]);
const GRASS_TOP   = new Vector3([0.5,   0]);
const STONE       = new Vector3([0.75,  0]);

const SKYBOX1     = new Vector3([0,     0.25]);
const SKYBOX2     = new Vector3([0.25,  0.25]);
const SKYBOX3     = new Vector3([0.5,   0.25]);
const SKYBOX4     = new Vector3([0.75,  0.25]);
const SKYBOX5     = new Vector3([0,     0.5]);
const SKYBOX6     = new Vector3([0.25,  0.5]);

const COBBLESTONE = new Vector3([0.5,   0.5]);
const SAND        = new Vector3([0.75,  0.5]);
const GRAVEL      = new Vector3([0,     0.75]);
const OAK_PLANKS  = new Vector3([0.25,  0.75]);    
const BEDROCK     = new Vector3([0.5,   0.75]);
const BRICKS      = new Vector3([0.75,  0.75]);

//order: front left right back top bottom
function GetUVsForTexture(block) {
    let uvs = [];
    switch (block) {
        case "grass_block":
            uvs = uvs.concat(extractSingularSquare(GRASS_SIDE));
            uvs = uvs.concat(extractSingularSquare(GRASS_SIDE));
            uvs = uvs.concat(extractSingularSquare(GRASS_SIDE));
            uvs = uvs.concat(extractSingularSquare(GRASS_SIDE));
            uvs = uvs.concat(extractSingularSquare(GRASS_TOP));
            uvs = uvs.concat(extractSingularSquare(DIRT));

            break;
        case "stone_block":
            for (let i = 0; i < 6; i++)
                uvs = uvs.concat(extractSingularSquare(STONE));
            break;
        
        case "skybox":
            uvs = uvs.concat(extractSingularSquare(SKYBOX1));
            uvs = uvs.concat(extractSingularSquare(SKYBOX4));
            uvs = uvs.concat(extractSingularSquare(SKYBOX3));
            uvs = uvs.concat(extractSingularSquare(SKYBOX5));
            uvs = uvs.concat(extractSingularSquare(SKYBOX6));
            uvs = uvs.concat(extractSingularSquare(SKYBOX2));

            break;
        
        case "cobblestone":
            for (let i = 0; i < 6; i++)
                uvs = uvs.concat(extractSingularSquare(COBBLESTONE));
            break;

        case "sand":
            for (let i = 0; i < 6; i++)
                uvs = uvs.concat(extractSingularSquare(SAND));
            break;

        case "gravel":
            for (let i = 0; i < 6; i++)
                uvs = uvs.concat(extractSingularSquare(GRAVEL));
            break;
            
        case "oak_planks":
            for (let i = 0; i < 6; i++)
                uvs = uvs.concat(extractSingularSquare(OAK_PLANKS));
            break;

        case "bedrock":
            for (let i = 0; i < 6; i++)
                uvs = uvs.concat(extractSingularSquare(BEDROCK));
            break;

        case "bricks":
            for (let i = 0; i < 6; i++)
                uvs = uvs.concat(extractSingularSquare(BRICKS));
            break;
        
        case "dirt":
            for (let i = 0; i < 6; i++)
                uvs = uvs.concat(extractSingularSquare(DIRT));
            break;

    }

    return uvs;
}

function extractSingularSquare(textureOffset) {
    let UVs = [];
    UVs.push(0, 0,     0, 0.25,   0.25, 0);
    UVs.push(0.25, 0,  0, 0.25,   0.25, 0.25);

    const EPSILON = 0.0001;
    for (let i = 0; i < 12; i++) {
        UVs[i] += (i % 2 == 0) ? textureOffset.x - 0 : textureOffset.y - 0;
    }
    
    return UVs;
}




//skybox texture from https://opengameart.org/content/sky-box-sunny-day
const texturePath = 'textures/';
const textures = [
   'texture_atlas.png'
]
function initTextures(n) {
    let numLoadedTextures = 0;

    for (let i = 0; i < textures.length; i++) {
        let img = new Image();

        img.onload = function() {
            loadTexture(n, img, i);
            numLoadedTextures++;

            if (numLoadedTextures == textures.length)
                renderAllShapes();
        }
    
        img.src = texturePath + textures[i];
    }
    
    return true;
}

function loadTexture(n, img, samplerID) {
    let texture = gl.createTexture();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0 + samplerID);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1i(u_Samplers[samplerID], samplerID);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}