import * as THREE from 'three';
import * as globularShader from "./shaders/orbular.glsl.js"
import { Font, FontLoader } from 'three/examples/jsm/Addons.js';
import { createTextRing } from './js/sphere-focus-ring.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

import { setupNavigation } from "./js/navigation.ts"

setupNavigation()


const width = window.innerWidth
const height = window.innerHeight
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, width / height, 1, 10000);
const renderer = new THREE.WebGLRenderer();

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
})

// TODO synchronously loading fonts, should change
const fonts = await loadFonts()//.then(fonts => {

const stats = new Stats()
// the number will decide which information will be displayed
// 0 => FPS Frames rendered in the last second. The higher the number the better.
// 1 => MS Milliseconds needed to render a frame. The lower the number the better.
// 2 => MB MBytes of allocated memory. (Run Chrome with --enable-precise-memory-info)
// 3 => CUSTOM User-defined panel support.
stats.showPanel(0)
document.body.appendChild(stats.dom)

camera.position.z = 1000
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement);


// SPHERE
const mobile = width / height <= 0.6
console.log("mobile", mobile)
let sRadius = height / 2
let sOffsetX = 0
if (mobile) {
    sRadius = (0.45 * height)
    sOffsetX = 0.5 * width
} else {
    sRadius = Math.min(0.6 * width, 0.6 * height)
    console.log("width, height")
    console.log(width, height)
    console.log(0.6 * width, 0.7 * height)
    sOffsetX = 0
}
console.log(sRadius, sOffsetX)

// TODO fix/add/remove those last func params, no clue what the values are doing, trying to optimize vertex count
const geometry = new THREE.SphereGeometry(sRadius, sRadius / 4, sRadius / 4, 0 * Math.PI, 1 * Math.PI);
// rotate geometry (not object) to hide vertex density non-uniformity which is especially noticeable at poles
geometry.rotateZ(0.25 * Math.PI)
// unfortunately couldn't get much more (entirely) uniform Icos to work...
// const geometry = new THREE.IcosahedronGeometry(sRadius, Math.round(sRadius / 10))//.toNonIndexed();

const vShaderSphere = globularShader.vertex
const fShaderSphere = globularShader.fragment

const verts = geometry.getAttribute("position").count;
const values = []

for (let v = 0; v < verts; v++) {
    // displacement values for each vertex, value between 
    values.push((0.6 + (Math.random() * 0.4)));
}
const positions = new Float32Array(values);
geometry.setAttribute("displacement", new THREE.BufferAttribute(positions, 1))

const material = new THREE.ShaderMaterial({
    uniforms: {
        pointer_direction: {
            value: new THREE.Vector3()
        },
        extrusion: {
            value: THREE.FloatType
        },
        amplitude: {
            value: THREE.FloatType
        },
        radius: {
            value: THREE.FloatType
        },
        scale: {
            value: THREE.FloatType
        },
    },
    vertexShader: vShaderSphere,
    fragmentShader: fShaderSphere
})

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere)

/////////////////////////////////
// POSITION SPHERE IN CORNER
/////////////////////////////////
// Using this depth will place it at 0 (within floating error)
// Since camera is at z=1000 ---- this really doesn't matter though
// as it is compensated for below
const depth = 1000;

// This is right at the bottom left corder of view
// and the z=1 means it is at the far plane of frustum
// which means dimensions can be given relative to window dimensions
// since scene is rendered at window dimensions so anything with those dimensions
// at the far render plane will be true
const ndc = new THREE.Vector3(-1, -1, 1) // 0.5 is the depth (z)
// Unproject the NDC point to world space
ndc.unproject(camera)
// Compute direction vector from camera to the point
const dir = ndc.sub(camera.position).normalize();

// Then find the position in world by adding to camera position the direction along
// that bottom left edge of frustum according to depth
const worldPos = camera.position.clone().add(dir.multiplyScalar(depth));

//const radius = sphere.geometry.parameters.radius
// Adjust object scale to maintain screen siz10
// see this: https://discussions.unity.com/t/calculating-perspective-camera-size-at-depth/60559
// and this chat: https://chatgpt.com/share/67eea440-74c4-800f-b646-1e8182151ed1
// and this: https://threejs.org/manual/#en/faq
const worldHeightAtDepth = 2 * depth * Math.tan(0.5 * camera.fov * Math.PI / 180);
const pixelsToWorld = worldHeightAtDepth / height;
sphere.position.copy(worldPos).add(new THREE.Vector3(sRadius / 4 * pixelsToWorld - sOffsetX * pixelsToWorld, sRadius / 4 * pixelsToWorld, 0));
sphere.scale.set(pixelsToWorld, pixelsToWorld, pixelsToWorld);
sphere.material.uniforms.radius.value = sRadius * pixelsToWorld;
// need to specify scale, because it doesn't apply to vertices in shader
// so any transformation to their pos isn't consistent with radius [without this]
sphere.material.uniforms.scale.value = pixelsToWorld
/////////////////////////////////
// TEXT
/////////////////////////////////

// const textRingZContent = "<><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>"
// const textRingZ = createTextRing({
//     content: textRingZContent,
//     font: fonts.ibm,
//     position: worldPos,
//     ringRadius: sRadius / 1,
//     extensionLimit: 0.1,
//     sphereRadius: sRadius,
//     relativeHeight: 0.85,
//     pixelsToWorld,
// })
// scene.add(textRingZ)
//
// const textRingAContent = "<><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>"
// const textRingA = createTextRing({
//     content: textRingAContent,
//     font: fonts.ibm,
//     position: worldPos,
//     ringRadius: sRadius / 1.5,
//     extensionLimit: 0.22,
//     sphereRadius: sRadius,
//     pixelsToWorld,
// })
// scene.add(textRingA)

// const textRingBContent = "<><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>"
// const textRingB = createTextRing({
//     content: textRingBContent,
//     font: fonts.ibm,
//     position: worldPos,
//     ringRadius: sRadius / 3,
//     extensionLimit: 0.5,
//     sphereRadius: sRadius,
//     pixelsToWorld,
// })
// scene.add(textRingB)

// const textRingCContent = "<><><><><><><><><><><><><><><><><><><><><><>"
// const textRingC = createTextRing({
//     content: textRingCContent,
//     font: fonts.ibm,
//     position: worldPos,
//     ringRadius: sRadius / 5,
//     sphereRadius: sRadius,
//     extensionLimit: 0.9,
//     pixelsToWorld,
// })
// scene.add(textRingC)
// const newText = text.clone()
// scene.add(newText)


let sphereToPointer = new THREE.Vector3()
const worldPointerPos = new THREE.Vector3()
window.addEventListener("mousemove", (e) => {
    //const worldPos = windowToWorld(e, depth - sRadius / 10)
    worldPointerPos.copy(windowToWorld(e, depth - sRadius / 6))
    // sphere pos to mouse pos
    sphereToPointer.copy(worldPointerPos.sub(sphere.position))

    // console.log(sphereToPointer.length(), pixelsToWorld * sRadius)
    //console.log(Math.max(0, sphereToPointer.length() - pixelsToWorld * sRadius))
})


// RENDERING AND ANIMATING

const clock = new THREE.Clock(true)
let delta = 0
let frame = 0

let extrusion = 0;
let absoluteExtrusion = 0;

const sphereToPointerAllocation = new THREE.Vector3()

function animate() {
    stats.begin()

    extrusion = Math.max((sphereToPointer.length() - sRadius * pixelsToWorld), 0);
    absoluteExtrusion = sphereToPointer.length();
    //console.log("ABSOLUTE", absoluteExtrusion, sRadius * pixelsToWorld)

    delta = clock.getDelta()
    frame += 1 * delta
    material.uniforms.pointer_direction.value = sphereToPointer;
    material.uniforms.extrusion.value = absoluteExtrusion
    material.uniforms.amplitude.value += delta * 10 //* 5 * Math.min(0.6 + extrusion, 1);

    // we want the rings to extend with extrusion, interpolate between 0 and max
    // as a function of extrusion

    sphereToPointerAllocation.copy(sphereToPointer)
    sphereToPointerAllocation.normalize()

    // textRingZ.onAnimate(delta, sphere.position, sphereToPointerAllocation, absoluteExtrusion)
    // textRingA.onAnimate(delta, sphere.position, sphereToPointerAllocation, absoluteExtrusion)
    // textRingB.onAnimate(delta, sphere.position, sphereToPointerAllocation, absoluteExtrusion)
    // textRingC.onAnimate(delta, sphere.position, sphereToPointerAllocation, absoluteExtrusion)

    stats.end()

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);


let vec = new THREE.Vector3(); // create once and reuse
let pos = new THREE.Vector3(); // create once and reuse

function windowToWorld(event: MouseEvent, depth: number = 1000) {
    vec.set(
        (event.clientX / width) * 2 - 1,
        - (event.clientY / height) * 2 + 1,
        1,
    );

    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    pos.copy(camera.position).add(vec.multiplyScalar(depth - sRadius * pixelsToWorld * 0.1));
    return pos
}


type Fonts = {
    [name: string]: Font
}


async function loadFonts(): Promise<Fonts> {
    const loader = new FontLoader();

    const fonts: Fonts = {}
    const font = await loader.loadAsync('/public/fonts/Absans_Regular.json', function(font) {
    });

    fonts.ibm = font

    return fonts
}

