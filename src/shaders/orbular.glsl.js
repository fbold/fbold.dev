export const vertex = /* glsl */ `

varying vec3 vWorldPosition;
varying vec3 vNormal;
attribute float displacement;
uniform vec3 pointer_direction;
uniform float extrusion;
uniform float time;
uniform float radius;
uniform float scale;

#define M_PI 3.1415926535897932384626433832795

void main() {
    vNormal = normal;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    float dotVal = dot(normalize(vNormal), normalize(pointer_direction));
    float asinDotVal = asin(dotVal);
    // then we make time of sin function bigger
    // constant multiplier is to compensate for 0.8 limiting
    // domain and therfore recorregut of sin, ie make it normalized again
    float sinDotVal = 1.051462224 * sin(asinDotVal * 0.8);
    // power it to distort and make steeper
    float level = pow(max(sinDotVal, 0.0), 16.0);
    float wobbleLevel = pow(max(sinDotVal, 0.0), 4.0);

    // now range of level is -1 to 1
    float wobble = 6.0 * sin(10.0 * displacement * radius + time);
    float slowWobble = 5.0 * sin(2.0 * displacement * radius + time * 0.3);

    // need to divide by scale because it is in non-adjusted world dimensions
    // NOTE it is limited to radius, ie range of extrusion_ is 0 to radius
    float extrusion_ = min(max(extrusion - 0.9 * radius, 0.0) / scale, 1.5 * radius);

    vec3 newPosition = position + normalize(normal) * vec3(level * displacement * extrusion_ + wobble * wobbleLevel) + normalize(normal) * slowWobble;

    gl_Position = projectionMatrix *
            modelViewMatrix *
            vec4(newPosition, 1.0);
}
`

export const fragment = /* glsl */ `
// same name and type as VS
uniform vec3 rippleCenter;
uniform float rippleStartTime;
uniform float time;
uniform float radius;
varying vec3 vNormal;
varying vec3 vWorldPosition;

vec3 baseColor = vec3(1.0, 1.0, 1.0);
vec3 rippleColor = vec3(1.0, 0.0, 0.0);

void main() {
    // calc the dot product and clamp
    // 0 -> 1 rather than -1 -> 1
    vec3 light = vec3(0.8, 0.8, 10.0);

    // ensure it's normalized
    light = normalize(light);

    // calculate the dot product of
    // the light to the vertex normal
    float dProd = max(0.0, dot(vNormal, light));

    // float dist = distance(vWorldPosition, rippleCenter);
    // float ripple = sin(dist * 0.1 - time * 3.0);
    // ripple = 0.5 + 0.5 * ripple;

    float elapsed = time - rippleStartTime;
    if (elapsed < 0.0) discard; // Not started yet

    float dist = distance(vWorldPosition, rippleCenter);
    float rippleRadius = elapsed * 70.0; // how fast the ripple expands
    float rippleThickness = 100.0; // how thick the ripple ring is

    float edge = smoothstep(rippleRadius - rippleThickness, rippleRadius, dist) *
            (1.0 - smoothstep(rippleRadius, rippleRadius + rippleThickness, dist));

    vec3 color = mix(baseColor, rippleColor, edge);
    gl_FragColor = vec4(dProd * color, 1.0);

    //   float max = 0.8;
    //   float min = 0.5;
    //
    //   float redness = clamp((vHeight)/500.0, min, max);
    //   float otherness = (redness - min) / (max - min);
    //   vec3 coloured = dProd * vec3(redness, min - min * otherness, min - min * otherness);

    // feed into our frag colour
    // gl_FragColor = vec4(dProd, // R
    //         dProd, // G
    //         dProd, // B
    //         1.0); // A
}
`
