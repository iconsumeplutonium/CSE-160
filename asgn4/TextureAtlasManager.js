//so the reason why several textures are duplicated in my atlas is because of texture atlas bleeding
//something to do with the fact that the fragment at the UV coordinate can lie exactly between two different textures' pixels
//and so it interpolates between them, leading to a visible seam along the edge of the block
//so i was having issues with gray boxes around sand (because I had my sand texture next to my cobblestone texture), and white lines around my 
//cactus and oak log textures (because they all border the skybox texture)
//to fix this, i duplicated those textures, moved them into their own corners, and surrounded it with duplicates of themselves
//that way, it "bleeds" into its own color
//https://gamedev.stackexchange.com/questions/46963/how-to-avoid-texture-bleeding-in-a-texture-atlas

//the bottom left corner of the texture in the texture atlas
const DIRT           = new Vector3([0,          0]);
const GRASS_SIDE     = new Vector3([0.125,      0]);
const GRASS_TOP      = new Vector3([0.25,       0]);
const STONE          = new Vector3([0.375,      0]);
const GRAVEL         = new Vector3([0.5,        0]);
const OAK_PLANKS     = new Vector3([0.625,      0]);
const BEDROCK        = new Vector3([0.75,       0]);
const BRICKS         = new Vector3([0.875,      0]);

const SKYBOX1        = new Vector3([0,      0.125]);
const SKYBOX2        = new Vector3([0.125,  0.125]);
const SKYBOX3        = new Vector3([0.25,   0.125]);
const SKYBOX4        = new Vector3([0.375,  0.125]);
const SKYBOX5        = new Vector3([0.5,    0.125]);
const SKYBOX6        = new Vector3([0.625,  0.125]);
const COBBLESTONE    = new Vector3([0.75,   0.125]);
const SAND           = new Vector3([0.875,  0.875]);

const OAK_LOG_TOP    = new Vector3([0,      0.25]);
const OAK_LOG_SIDE   = new Vector3([0,      0.375]);
const OAK_LEAVES     = new Vector3([0,      0.875]);
const CACTUS_SIDE    = new Vector3([0.375,  0.875]);
const CACTUS_TOP     = new Vector3([0.5,    0.25]);
const CACTUS_BOTTOM  = new Vector3([0.625,  0.25]);

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
        
        case "oak_log":
            uvs = uvs.concat(extractSingularSquare(OAK_LOG_SIDE));
            uvs = uvs.concat(extractSingularSquare(OAK_LOG_SIDE));
            uvs = uvs.concat(extractSingularSquare(OAK_LOG_SIDE));
            uvs = uvs.concat(extractSingularSquare(OAK_LOG_SIDE));
            uvs = uvs.concat(extractSingularSquare(OAK_LOG_TOP));
            uvs = uvs.concat(extractSingularSquare(OAK_LOG_TOP));

            break;
        
        case "oak_leaves":
            for (let i = 0; i < 6; i++)
                uvs = uvs.concat(extractSingularSquare(OAK_LEAVES));
            break;

        case "cactus":
            uvs = uvs.concat(extractSingularSquare(CACTUS_SIDE));
            uvs = uvs.concat(extractSingularSquare(CACTUS_SIDE));
            uvs = uvs.concat(extractSingularSquare(CACTUS_SIDE));
            uvs = uvs.concat(extractSingularSquare(CACTUS_SIDE));
            uvs = uvs.concat(extractSingularSquare(CACTUS_TOP));
            uvs = uvs.concat(extractSingularSquare(CACTUS_BOTTOM));

            break;
    }

    return uvs;
}

function extractSingularSquare(textureOffset) {
    let UVs = [];
    UVs.push(0, 0,      0, 0.125,   0.125, 0);
    UVs.push(0.125, 0,  0, 0.125,   0.125, 0.125);

    const EPSILON = 0.0001;
    for (let i = 0; i < 12; i++) {
        UVs[i] += (i % 2 == 0) ? textureOffset.x + 0 : textureOffset.y - 0;
    }
    
    return UVs;
}




//skybox texture from https://opengameart.org/content/sky-box-sunny-day
const texturePath = 'textures/';
const textures = [
   'texture_atlas2.png'
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