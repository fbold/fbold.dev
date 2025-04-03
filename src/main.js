import * as THREE from 'three';

const width = window.innerWidth
const height = window.innerHeight
const scene = new THREE.Scene();
//const camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);
const camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
camera.position.z = 1000
// camera.position.y = 10
// camera.position.y = 10

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);

document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(Math.max(width, height) / 2, 120, 120);

const vShader = document.getElementById("vertexshader")
const fShader = document.getElementById("fragmentshader")

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
            type: 'f',
            value: 0
        }
    },
    vertexShader: vShader.textContent,
    fragmentShader: fShader.textContent
})
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Create a vector to store the normalized device coordinates
//const NDC = new THREE.Vector3(-width / 2, -height / 2, 0); // 0.5 is the depth (z)
// const ndcNear = new THREE.Vector3(-1, -1, 0.5); // 0.5 is the depth (z)
// const ndcFar = new THREE.Vector3(-1, -1, 1); // 0.5 is the depth (z)
//
// const radius = cube.geometry.parameters.radius / 4
// ndcNear.unproject(camera).add(camera.position).add(new THREE.Vector3(radius, radius, 0))
// ndcFar.unproject(camera).add(camera.position).add(new THREE.Vector3(radius, radius, 0))


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

const radius = 0//cube.geometry.parameters.radius / 5
// Adjust object scale to maintain screen size
// see this: https://discussions.unity.com/t/calculating-perspective-camera-size-at-depth/60559
// and this chat: https://chatgpt.com/share/67eea440-74c4-800f-b646-1e8182151ed1
const worldHeightAtDepth = 2 * depth * Math.tan(0.5 * camera.fov * Math.PI / 180);
const pixelsToWorld = worldHeightAtDepth / Math.max(width, height);
console.log("WorldPos", worldPos)
console.log("Scale", pixelsToWorld)
cube.position.copy(worldPos).add(new THREE.Vector3(radius * pixelsToWorld, radius * pixelsToWorld, 0));
cube.scale.set(pixelsToWorld, pixelsToWorld, pixelsToWorld);


let sphereToPointer = new THREE.Vector3()
window.addEventListener("mousemove", (e) => {
    const worldPos = windowToWorld(e)
    // sphere pos to mouse pos
    sphereToPointer = worldPos.sub(cube.position)
})


let vec = new THREE.Vector3(); // create once and reuse
let pos = new THREE.Vector3(); // create once and reuse

function windowToWorld(event) {
    vec.set(
        (event.clientX / width) * 2 - 1,
        - (event.clientY / height) * 2 + 1,
        0.5,
    );

    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    pos.copy(camera.position).add(vec.multiplyScalar(0.6 * depth));
    return pos
}

console.log(camera.position)

let frame = 0
// let alpha = 0.1
// const pos = new THREE.Vector3()
// const v1 = new THREE.Vector3()
//
// let skip = 0

function animate() {
    // alpha += 0.0001
    // skip++
    //
    // v1.copy(ndcNear)
    // pos.copy(v1.lerp(ndcFar, alpha))
    // cube.position.copy(pos)
    //
    // if (skip % 60 === 0)
    //     console.log(alpha, pos)

    frame += 0.03
    geometry.setAttribute("displacement", new THREE.BufferAttribute(positions, 1))
    material.uniforms.pointer_direction.value = sphereToPointer;
    material.uniforms.amplitude.value = frame;
    renderer.render(scene, camera);

}
//renderer.render(scene, camera);
