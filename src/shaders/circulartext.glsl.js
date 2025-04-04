export const vertex = /* glsl */`
// create a shared variable for the
// VS and FS containing the normal
varying vec3 vNormal;

uniform float length;
uniform float radius;
uniform float time;
attribute float xPos;

#define M_PI 3.1415926535897932384626433832795

void main() {
    vNormal = normal;

    // TODO cand make this ork ith letter width ith monospace
    // or at least sort out the lack of spacing on the wrap
    float offset = time * 0.5;
    float z = cos(2.0*M_PI*xPos/length + offset)*radius;
    float x = sin(2.0*M_PI*xPos/length + offset)*radius;

    vec3 newPosition = vec3(x, position.y, z);
    //vec3 newPosition = position + vec3(0, xPos, 0);


    gl_Position = projectionMatrix *
            modelViewMatrix *
            vec4(newPosition, 1.0);
}
`

export const fragment = /* glsl */`
    // same name and type as VS
    varying vec3 vNormal;
    varying float vHeight;
    void main() {
      //vec3 light = vec3(-0.2, -0.2, 2.0);
    
    
      // feed into our frag colour
      gl_FragColor = vec4(0.8, // R
                          0.1, // G
                          0.1, // B
                          1.0);  // A
    
    }
`
