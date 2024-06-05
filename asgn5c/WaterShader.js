export const vertexShader = `
varying vec3 v_Position;
varying vec3 v_Normal;

uniform float u_Time;

struct Wave {
    float amplitude;
    float speed;
    float frequency;
    
    vec2 dir;
};

vec3 waveNormal(vec3 p, Wave w) {              
    float phase = w.speed * w.frequency;
    float x = dot(p.xz, w.dir) * w.frequency + u_Time * phase;

    float dx = w.frequency * w.amplitude * w.dir.x * exp(sin(x) - 1.0) * cos(x);
    float dz = w.frequency * w.amplitude * w.dir.y * exp(sin(x) - 1.0) * cos(x);
    
    return vec3(dx, 0.01, dz);
}

void main() {
    Wave w;
    w.amplitude = 5.0;
    float wavelength = 64.0;
    w.frequency = 2.0 / wavelength;
    w.speed = 0.05;
    w.dir = vec2(1.0);

    int numWaves = 28;
    float height = 0.0;
    vec3 normal = vec3(0.0);
    float iter = 0.0;

    float persistence = 0.82;
    float lacunarity = 1.18;
    float timeMult = 0.7;
    float amplitudeThreshold = 0.1;

    //to ensure the tinier sine waves dont affect the normal lighting (otherwise, you get a noticable grid of lines going back and forth across the water surface)
    float normalContribution = 1.0;
    float contributionFalloff = 0.91;

    vec3 pos = position;

    for (int i = 0; i < numWaves; i++) {
        iter += 1232.399963;
        w.dir = vec2(sin(iter), cos(iter));
        float phase = w.speed * w.frequency;

        float x = dot(pos.xz, w.dir) * w.frequency + u_Time * phase;
        float wave = w.amplitude * exp(sin(x) - 1.0);
        float dx = w.amplitude * wave * cos(x);


        height += wave;
        pos.xz += w.dir * -dx * w.amplitude * 0.125;
    
        normal += waveNormal(pos, w) * normalContribution;
        normalContribution *= contributionFalloff;


        w.amplitude *= persistence;
        w.frequency *= lacunarity;
        w.speed *= timeMult;
    }

    v_Position = vec3(position.x, height, position.z);
    v_Normal = normal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(v_Position, 1.0);
}
`




export const fragmentShader = `
uniform vec3 u_LightPos;
uniform vec3 u_FragColor;
uniform vec3 u_CameraPos;

varying vec3 v_Position;
varying vec3 v_Normal;

uniform samplerCube u_Skybox;

uniform bool useEnvReflct;
uniform bool useScattering;

void main() {
    vec3 L = normalize(u_LightPos);
    vec3 N = normalize(v_Normal);
    vec3 R = normalize(2.0 * dot(L, N) * N - L);
    vec3 V = normalize(u_CameraPos - v_Position);

    float fresnel = pow(1.0 - dot(N, V), 5.0) + 0.2;

    vec3 k_d = vec3(0.5);
    vec3 diffuse =  max(dot(L, N), 0.0) * u_FragColor;
    vec3 specular = vec3(1.0) * pow(max(dot(R, V), 0.0), 5.0) * fresnel;
    vec3 ambient = vec3(0.5) * u_FragColor;

    vec3 R2 = normalize(2.0 * dot(N, V) * N - V);
    vec3 reflectedSkyboxCol = textureCube(u_Skybox, R2).xyz;

    vec3 environRflct         =  (useEnvReflct)  ?  reflectedSkyboxCol * fresnel * 0.1                               :  vec3(0.0);
    vec3 subsurfaceScattering =  (useScattering) ?  vec3(0.0293, 0.0698, 0.1717) * 0.1 * (0.2 + v_Position.y / 2.0)  :  vec3(0.0);  //scattering "formula" from here: https://www.shadertoy.com/view/MdXyzX

    gl_FragColor = vec4(diffuse + ambient + specular + environRflct + subsurfaceScattering, 1.0);
}`;