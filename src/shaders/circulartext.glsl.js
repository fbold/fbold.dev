export const vertex = /* glsl */ `
// create a shared variable for the
// VS and FS containing the normal
varying vec3 vNormal;

uniform float length;
// radius of ring
uniform float radius;
// radius of sphere, not scaled
uniform float sRadius;
uniform float scale;
uniform float extrusion;
uniform float meshStart;
uniform float time;
attribute float xPos;

#define M_PI 3.1415926535897932384626433832795

float amplitude = 6.0;
void main() {
    vNormal = normal;

    // TODO cand make this ork ith letter width ith monospace
    // or at least sort out the lack of spacing on the wrap
    // fixes loss-of-depth issue with second term, meshStart is provided
    // as uniform, just z component of first vertex then transform around circle
    float offset = time;
    float x = sin(2.0 * M_PI * xPos / length + offset) * (radius) + (position.z - meshStart) * sin(2.0 * M_PI * xPos / length + offset);
    float z = cos(2.0 * M_PI * xPos / length + offset) * (radius) + (position.z - meshStart) * cos(2.0 * M_PI * xPos / length + offset);

    // need to divide by scale because it is in non-adjusted world dimensions
    // not radius, idk why tbh.. lost in the scaling and screen-world stuff
    float extrusion_ = min(max(extrusion / scale - sRadius, 0.0), sRadius);
    // this preserves the height of the letters
    // and the second components inside sin is for wave effect
    float offsetY = time * 4.0; //time;
    float y = sin(20.0 * M_PI + offsetY + position.x / 20.0) * amplitude + position.y + extrusion_;

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
