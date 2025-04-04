import * as THREE from 'three';
import * as globularShader from "./shaders/orbular.glsl.js"

const width = window.innerWidth
const height = window.innerHeight
const scene = new THREE.Scene();
//const camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);
const camera = new THREE.PerspectiveCamera(30, width / height, 1, 10000);
camera.position.z = 1000
// camera.position.y = 10
// camera.position.y = 10

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);

document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(Math.max(width, height) / 2, 120, 120);

const vShader = globularShader.vertex
const fShader = globularShader.fragment
console.log(globularShader.vertex)

var attributes = {
    displacement: {
        type: 'f', // a float
        value: [] // an empty array
    }
}

let verts = geometry.getAttribute("position").count;

let values =
    attributes.displacement.value;

console.log(verts)
for (let v = 0; v < verts; v++) {
    values.push((0.5 + Math.min(Math.random(), 1)) * geometry.parameters.radius * 0.1);
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
scene.add(cube);

const geometryRing = new THREE.TorusGeometry(200, 10, 20, 20);
const ring = new THREE.Mesh(geometryRing, new THREE.MeshBasicMaterial({ color: "rgba(1,0,0,1)" }));
// ring.rotateX(90)
// ring.rotateY(90)
scene.add(ring)

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

const radius = cube.geometry.parameters.radius / 4
// Adjust object scale to maintain screen siz10
// see this: https://discussions.unity.com/t/calculating-perspective-camera-size-at-depth/60559
// and this chat: https://chatgpt.com/share/67eea440-74c4-800f-b646-1e8182151ed1
// and this: https://threejs.org/manual/#en/faq
const worldHeightAtDepth = 2 * depth * Math.tan(0.5 * camera.fov * Math.PI / 180);
const pixelsToWorld = worldHeightAtDepth / Math.max(width, height);
console.log("WorldPos", worldPos)
console.log("Scale", pixelsToWorld)
cube.position.copy(worldPos).add(new THREE.Vector3(radius * pixelsToWorld, radius * pixelsToWorld, 0));
cube.scale.set(pixelsToWorld, pixelsToWorld, pixelsToWorld);
ring.position.copy(worldPos).add(new THREE.Vector3(cube.geometry.parameters.radius * pixelsToWorld, cube.geometry.parameters.radius * pixelsToWorld, 0));
ring.scale.set(pixelsToWorld, pixelsToWorld, pixelsToWorld);


let sphereToPointer = new THREE.Vector3()
window.addEventListener("mousemove", (e) => {
    const worldPos = windowToWorld(e)
    // sphere pos to mouse pos
    sphereToPointer = worldPos.sub(cube.position)
})


let vec = new THREE.Vector3(); // create once and reuse
let pos = new THREE.Vector3(); // create once and reuse

function windowToWorld(event) {
    console.log(event.clientX / width)
    vec.set(
        (event.clientX / width) * 2 - 1,
        - (event.clientY / height) * 2 + 1,
        1,
    );
    console.log(vec)

    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    pos.copy(camera.position).add(vec.multiplyScalar(0.85 * depth));
    return pos
}

console.log(camera.position)

let frame = 0
let ringPos = new THREE.Vector3()

function animate() {
    frame += 0.01
    geometry.setAttribute("displacement", new THREE.BufferAttribute(positions, 1))
    material.uniforms.pointer_direction.value = sphereToPointer;
    material.uniforms.amplitude.value = frame * 5;


    ringPos.copy(cube.position)
    ringPos.add(sphereToPointer.clone().normalize().multiplyScalar(1.2 * cube.geometry.parameters.radius * pixelsToWorld))
    // ringPos.multiplyScalar(cube.geometry.parameters.radius * pixelsToWorld)
    ring.lookAt(cube.position)
    ring.position.copy(ringPos)

    renderer.render(scene, camera);

}
//renderer.render(scene, camera);
