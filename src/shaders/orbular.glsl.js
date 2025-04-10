export const vertex = /* glsl */ `

varying vec3 vNormal;
attribute float displacement;
uniform vec3 pointer_direction;
uniform float extrusion;
uniform float amplitude;
uniform float radius;
uniform float scale;

#define M_PI 3.1415926535897932384626433832795

void main() {
    vNormal = normal;

    float dotVal = dot(normalize(vNormal), normalize(pointer_direction));
    float asinDotVal = asin(dotVal);
    // then we make amplitude of sin function bigger
    // constant multiplier is to compensate for 0.8 limiting
    // domain and therfore recorregut of sin, ie make it normalized again
    float sinDotVal = 1.051462224 * sin(asinDotVal * 0.8);
    // power it to distort and make steeper
    float level = pow(max(sinDotVal, 0.0), 16.0);

    // now range of level is -1 to 1
    float wobble = 6.0 * sin(10.0 * displacement * radius + amplitude);

    // need to divide by scale because it is in non-adjusted world dimensions
    // NOTE it is limited to radius, ie range of extrusion_ is 0 to radius
    float extrusion_ = min(max(extrusion - radius, 0.0) / scale, 1.2 * radius);

    vec3 newPosition = position + normalize(normal) * vec3(level * displacement * extrusion_ + wobble);

    gl_Position = projectionMatrix *
            modelViewMatrix *
            vec4(newPosition, 1.0);
}
`

export const fragment = /* glsl */ `
// same name and type as VS
varying vec3 vNormal;
void main() {
    // calc the dot product and clamp
    // 0 -> 1 rather than -1 -> 1
    vec3 light = vec3(0.8, 0.8, 10.0);

    // ensure it's normalized
    light = normalize(light);

    // calculate the dot product of
    // the light to the vertex normal
    float dProd = max(0.0, dot(vNormal, light));

    //   float max = 0.8;
    //   float min = 0.5;
    //
    //   float redness = clamp((vHeight)/500.0, min, max);
    //   float otherness = (redness - min) / (max - min);
    //   vec3 coloured = dProd * vec3(redness, min - min * otherness, min - min * otherness);

    // feed into our frag colour
    gl_FragColor = vec4(dProd, // R
            dProd, // G
            dProd, // B
            1.0); // A
}
`
