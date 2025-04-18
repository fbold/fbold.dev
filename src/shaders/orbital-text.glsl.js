export const vertex = /* glsl */ `
// create a shared variable for the
// VS and FS containing the normal
varying vec3 vNormal;

uniform float length;
// radius of ring
uniform float radius;
// radius of sphere, yes scaled
uniform float sRadius;
uniform float scale;
uniform float meshStart;
uniform float meshStartY;
uniform float time;
attribute float xPos;

#define M_PI 3.1415926535897932384626433832795

float amplitude = 15.0;
float trueExtrusion;
float extrusion_;
void main() {
    vNormal = normal;

    // TODO cand make this ork ith letter width ith monospace
    // or at least sort out the lack of spacing on the wrap
    // fixes loss-of-depth issue with second term, meshStart is provided
    // as uniform, just z component of first vertex then transform around circle
    float offset = time;
    float angle = 2.0 * M_PI * xPos / length + offset;
    float x = sin(angle) * (radius) + (position.z - meshStart) * sin(angle); // - (position.y - meshStartY) * 0.25;
    float z = cos(angle) * (radius) + (position.z - meshStart) * cos(angle); // - (position.y - meshStartY) * 0.25;

    // this preserves the height of the letters
    // and the second components inside sin is for wave effect
    // divided b length and made multiple of pi so end matched start
    // NOTE THE NUMBER AT END OF SIN PAREN HAS TO BE EVEN
    float offsetY = time * 4.0; //time;
    float y = sin(offsetY + M_PI * position.x / length * 16.0) * amplitude + position.y;

    vec3 newPosition = vec3(x, y, z);
    //vec3 newPosition = position + vec3(0, xPos, 0);
    //vec3 newPosition = position;// + vec3(x, 0, z);

    gl_Position = projectionMatrix *
            modelViewMatrix *
            vec4(newPosition, 1.0);
}
`

export const fragment = /* glsl */ `
// same name and type as VS
varying vec3 vNormal;
void main() {
    //vec3 light = vec3(-0.2, -0.2, 2.0);

    // feed into our frag colour
    gl_FragColor = vec4(0.8, // R
            0.1, // G
            0.1, // B
            1.0); // A
}
`
