import * as THREE from 'three';
import * as globularShader from "./shaders/orbular.glsl.js"
import { Font, FontLoader } from 'three/examples/jsm/Addons.js';
import { createTextRing } from './js/sphere-focus-ring.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';


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

camera.position.z = 1000
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setAnimationLoop(animate);
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

const geometry = new THREE.SphereGeometry(sRadius, sRadius / 5, sRadius / 5);

const vShaderSphere = globularShader.vertex
const fShaderSphere = globularShader.fragment

const verts = geometry.getAttribute("position").count;
const values = []

for (let v = 0; v < verts; v++) {
    // displacement values for each vertex
    values.push((0.5 + Math.min(Math.random(), 1)) * sRadius * 0.1);
}
const positions = new Float32Array(values);
geometry.setAttribute("displacement", new THREE.BufferAttribute(positions, 1))

const material = new THREE.ShaderMaterial({
    uniforms: {
        pointer_direction: {
            value: new THREE.Vector3()
        },
        amplitude: {
            value: THREE.FloatType
        },
        radius: {
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

const radius = sphere.geometry.parameters.radius
// Adjust object scale to maintain screen siz10
// see this: https://discussions.unity.com/t/calculating-perspective-camera-size-at-depth/60559
// and this chat: https://chatgpt.com/share/67eea440-74c4-800f-b646-1e8182151ed1
// and this: https://threejs.org/manual/#en/faq
const worldHeightAtDepth = 2 * depth * Math.tan(0.5 * camera.fov * Math.PI / 180);
const pixelsToWorld = worldHeightAtDepth / height;
sphere.position.copy(worldPos).add(new THREE.Vector3(radius / 4 * pixelsToWorld - sOffsetX * pixelsToWorld, radius / 4 * pixelsToWorld, 0));
sphere.scale.set(pixelsToWorld, pixelsToWorld, pixelsToWorld);
sphere.material.uniforms.radius.value = sRadius;
/////////////////////////////////
// TEXT
/////////////////////////////////

const textRingAContent = "<><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>"
const textRingA = createTextRing({
    content: textRingAContent,
    font: fonts.ibm,
    position: worldPos,
    radius: radius / 3,
    pixelsToWorld,
})
scene.add(textRingA)

const textRingBContent = "<><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>"
const textRingB = createTextRing({
    content: textRingBContent,
    font: fonts.ibm,
    position: worldPos,
    radius: radius / 4.5,
    pixelsToWorld,
})
scene.add(textRingB)

const textRingCContent = "<><><><><><><><><><><><><><><><><><><><><><>"
const textRingC = createTextRing({
    content: textRingCContent,
    font: fonts.ibm,
    position: worldPos,
    radius: radius / 8,
    pixelsToWorld,
})
scene.add(textRingC)
// const newText = text.clone()
// scene.add(newText)


let sphereToPointer = new THREE.Vector3()
window.addEventListener("mousemove", (e) => {
    const worldPos = windowToWorld(e, depth - radius / 7)
    // sphere pos to mouse pos
    sphereToPointer = worldPos.sub(sphere.position)
    console.log(sphereToPointer)
})


// RENDERING AND ANIMATING
const stats = new Stats()
// the number will decide which information will be displayed
// 0 => FPS Frames rendered in the last second. The higher the number the better.
// 1 => MS Milliseconds needed to render a frame. The lower the number the better.
// 2 => MB MBytes of allocated memory. (Run Chrome with --enable-precise-memory-info)
// 3 => CUSTOM User-defined panel support.
stats.showPanel(0)

document.body.appendChild(stats.dom)

const clock = new THREE.Clock(true)
let delta = 0
let frame = 0
let textPosA = new THREE.Vector3()
let textPosB = new THREE.Vector3()
let textPosC = new THREE.Vector3()
let displacementBuffer = new THREE.BufferAttribute(positions, 1)

const textRotationA = new THREE.Vector3(1, 0, 0)
const textRotationB = new THREE.Vector3(-1, 0, 0)
const textRotationC = new THREE.Vector3(1, 0, 0)

let extrusion = 0;

function animate() {
    stats.begin()

    extrusion = Math.min(sphereToPointer.length() / sRadius, 1);

    delta = clock.getDelta()
    frame += 1 * delta
    geometry.setAttribute("displacement", displacementBuffer)
    material.uniforms.pointer_direction.value = sphereToPointer;
    material.uniforms.amplitude.value += delta * 5 * Math.min(0.6 + extrusion, 1);

    textPosA.copy(sphere.position)
    textPosA.add(sphereToPointer.clone().normalize().multiplyScalar((0.99 + extrusion * 0.2) * radius * pixelsToWorld))
    // @ts-ignore
    textRingA.material.uniforms.time.value += delta * (0.2 + extrusion);
    textRingA.lookAt(sphere.position)
    textRingA.rotateOnAxis(textRotationA, 0.5 * Math.PI)
    textRingA.position.copy(textPosA)

    textPosB.copy(sphere.position)
    textPosB.add(sphereToPointer.clone().normalize().multiplyScalar((0.99 + extrusion * 0.3) * radius * pixelsToWorld))
    // @ts-ignore
    textRingB.material.uniforms.time.value += delta * (0.2 + extrusion);
    textRingB.lookAt(sphere.position)
    textRingB.rotateOnAxis(textRotationB, 0.5 * Math.PI)
    textRingB.position.copy(textPosB)

    textPosC.copy(sphere.position)
    textPosC.add(sphereToPointer.clone().normalize().multiplyScalar((0.99 + extrusion * 0.45) * radius * pixelsToWorld))
    // @ts-ignore
    textRingC.material.uniforms.time.value += delta * (0.2 + extrusion);
    textRingC.lookAt(sphere.position)
    textRingC.rotateOnAxis(textRotationC, 0.5 * Math.PI)
    textRingC.position.copy(textPosC)

    stats.end()

    renderer.render(scene, camera);
}


let vec = new THREE.Vector3(); // create once and reuse
let pos = new THREE.Vector3(); // create once and reuse

function windowToWorld(event: MouseEvent, depth: number = 500) {
    vec.set(
        (event.clientX / width) * 2 - 1,
        - (event.clientY / height) * 2 + 1,
        1,
    );

    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    pos.copy(camera.position).add(vec.multiplyScalar(depth));
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

