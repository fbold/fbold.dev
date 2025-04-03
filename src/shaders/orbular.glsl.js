export const vertex = /* glsl */`
// create a shared variable for the
// VS and FS containing the normal
varying vec3 vNormal;
attribute float displacement;
uniform vec3 pointer_direction;
uniform float amplitude;

#define M_PI 3.1415926535897932384626433832795

void main() {
    vNormal = normal;

    // push the displacement into the
    // three slots of a 3D vector so
    // it can be used in operations
    // with other 3D vectors like
    // positions and normals
    // vec3 newPosition = position +
    //  normal * vec3(displacement) + pow(max(0.0, dot(vNormal, pointer_direction * vec3(0.006))), 3.0);
    //vec3 newPosition = position +
    // normal * vec3(displacement) + vec3(1.0)/dot(vNormal, pointer_direction);

    float dotVal = dot(normalize(vNormal), normalize(pointer_direction));
    float asindotval = asin(dotVal);
    float sindotval = 1.15 * sin(asindotval * M_PI / 4.0);
    float level = pow(max(sindotval, 0.0), 15.0);

    float wobble = 5.0 * sin(displacement + amplitude);

    vec3 newPosition = position +
            normal * vec3((displacement + wobble) * level);
    //normal * vec3((displacement+wobble) * level + wobble);
    //vec3 newPosition = position + normal * vec3(displacement/2.0 + wobble);

    gl_Position = projectionMatrix *
            modelViewMatrix *
            vec4(newPosition, 1.0);
}
`

export const fragment = /* glsl */`
    // same name and type as VS
    varying vec3 vNormal;
    void main() {
      // calc the dot product and clamp
      // 0 -> 1 rather than -1 -> 1
      vec3 light = vec3(-0.2, -0.5, 2.0);
    
      // ensure it's normalized
      light = normalize(light);
    
      // calculate the dot product of
      // the light to the vertex normal
      float dProd = max(0.0,
                        dot(vNormal, light));
    
      // feed into our frag colour
      gl_FragColor = vec4(dProd, // R
                          dProd, // G
                          dProd, // B
                          1.0);  // A
    
    }
`
