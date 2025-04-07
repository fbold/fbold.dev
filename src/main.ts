import * as THREE from 'three';
import * as globularShader from "./shaders/orbular.glsl.js"
import * as textShader from "./shaders/circulartext.glsl.js"
import { Font, FontLoader, TextGeometry } from 'three/examples/jsm/Addons.js';


const width = window.innerWidth
const height = window.innerHeight
const scene = new THREE.Scene();
//const camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);
const camera = new THREE.PerspectiveCamera(30, width / height, 1, 10000);
const renderer = new THREE.WebGLRenderer();

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
})


// initialize the scene, set all initial positions
// add event listeners
// create geometries and attach meshes
//
const fonts = await loadFonts()//.then(fonts => {
//create assets requiring fonts

// });
camera.position.z = 1000
// camera.position.y = 10
// camera.position.y = 10

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);


// SPHERE
const sRadius = width / 2
const geometry = new THREE.SphereGeometry(sRadius, width / 10, width / 10);

const vShader = globularShader.vertex
const fShader = globularShader.fragment

var attributes = {
    displacement: {
        type: 'f', // a float
        value: [] // an empty array
    }
}

let verts = geometry.getAttribute("position").count;
let values =
    attributes.displacement.value;

for (let v = 0; v < verts; v++) {
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
        }
    },
    vertexShader: vShader,
    fragmentShader: fShader
})
const cube = new THREE.Mesh(geometry, material);

// RING
const geometryRing = new THREE.TorusGeometry(sRadius / 5, 5 * (sRadius / 1000), 20 * sRadius / 500, 20);
// scene.add(ring)
scene.add(cube)

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

const radius = cube.geometry.parameters.radius
// Adjust object scale to maintain screen siz10
// see this: https://discussions.unity.com/t/calculating-perspective-camera-size-at-depth/60559
// and this chat: https://chatgpt.com/share/67eea440-74c4-800f-b646-1e8182151ed1
// and this: https://threejs.org/manual/#en/faq
const worldHeightAtDepth = 2 * depth * Math.tan(0.5 * camera.fov * Math.PI / 180);
const pixelsToWorld = worldHeightAtDepth / Math.max(width, height);
cube.position.copy(worldPos).add(new THREE.Vector3(radius / 4 * pixelsToWorld, radius / 4 * pixelsToWorld, 0));
cube.scale.set(pixelsToWorld, pixelsToWorld, pixelsToWorld);

// TEXT
//const textGeometry = new TextGeometry("==============================", {
// const textGeometry = new TextGeometry("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", {
const textGeometry = new TextGeometry("<><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>", {
    //const textGeometry = new TextGeometry("00000000000000000000000000000000000000000000000000000000", {
    font: fonts.ibm,
    size: 8,
    depth: 0.4,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0,
    bevelThickness: 0.1,
})
const tMaterial = new THREE.ShaderMaterial({
    uniforms: {
        meshStart: {
            value: THREE.FloatType,
        },
        length: {
            value: THREE.FloatType,
        },
        radius: {
            value: THREE.FloatType,
        },
        time: {
            value: THREE.FloatType,
        }
    },
    vertexShader: textShader.vertex,
    fragmentShader: textShader.fragment
})
// want to pass through the x position of every vertex
// so it can be used with total length to find angular position
const tVerts = textGeometry.getAttribute("position").count;
textGeometry.computeBoundingBox()
const txValues = []
const vPos = textGeometry.getAttribute("position")
for (let v = 0; v < tVerts; v++) {
    txValues.push(vPos.getX(v));
}
const tX = new Float32Array(txValues);
const boundingBox = new THREE.Vector3()
textGeometry.boundingBox.getSize(boundingBox)
tMaterial.uniforms.length.value = boundingBox.x
tMaterial.uniforms.radius.value = pixelsToWorld * radius / 3
tMaterial.uniforms.meshStart.value = vPos.getZ(0)

console.log(tX)
textGeometry.setAttribute("xPos", new THREE.Float32BufferAttribute(tX, 1))
// textGeometry.morphAttributes.position.map((ba, index) => {
//     ba.setX(index, index)
// })

const text = new THREE.Mesh(textGeometry, tMaterial);
text.position.copy(worldPos).add(new THREE.Vector3(radius * pixelsToWorld, radius * pixelsToWorld, 0));
text.scale.set(0.8, 0.8, 0.8)

scene.add(text)
const newText = text.clone()
// newText.scale.set(0.4, 0.4, 0.4)
scene.add(newText)


let sphereToPointer = new THREE.Vector3()
window.addEventListener("mousemove", (e) => {
    const worldPos = windowToWorld(e, depth - radius / 5)
    // sphere pos to mouse pos
    sphereToPointer = worldPos.sub(cube.position)
})

// RENDERING AND ANIMATING
let frame = 0
let ringPos = new THREE.Vector3()
let textPos = new THREE.Vector3()
let displacementBuffer = new THREE.BufferAttribute(positions, 1)

const textRotationInner = new THREE.Vector3(1, 0, 0)
const textRotationOuter = new THREE.Vector3(1, 0, 0)

function animate() {
    frame += 0.01
    geometry.setAttribute("displacement", displacementBuffer)
    material.uniforms.pointer_direction.value = sphereToPointer;
    material.uniforms.amplitude.value = frame * 5;


    ringPos.copy(cube.position)
    ringPos.add(sphereToPointer.clone().normalize().multiplyScalar(1.4 * radius * pixelsToWorld))

    // tMaterial.uniforms.time.value = frame;
    text.material.uniforms.time.value = frame;
    text.lookAt(cube.position)
    text.rotateOnAxis(textRotationInner, 0.5 * Math.PI)
    text.position.copy(ringPos)


    newText.material.uniforms.time.value = frame;
    newText.lookAt(cube.position)
    newText.rotateOnAxis(textRotationOuter, -0.5 * Math.PI)
    textPos.copy(cube.position)
    textPos.add(sphereToPointer.clone().normalize().multiplyScalar(1.2 * radius * pixelsToWorld))
    newText.position.copy(textPos)

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

