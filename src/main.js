import * as THREE from 'three';

const width = window.innerWidth
const height = window.innerHeight
const scene = new THREE.Scene();
//const camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);
const camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
camera.position.z = Math.max(width, height)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);

document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(width / 2, 120, 120);

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

cube.position.x = - width / 2 + cube.geometry.parameters.radius / 4
cube.position.y = - height / 2 + cube.geometry.parameters.radius / 4

let sphereToPointer = new THREE.Vector3()
window.addEventListener("mousemove", (e) => {
    console.log("sphereToPointer", sphereToPointer)
    const worldPos = windowToWorld(e)
    // sphere pos to mouse pos
    sphereToPointer = worldPos.sub(cube.position)
})


function windowToWorld(event) {
    let vec = new THREE.Vector3(); // create once and reuse
    let pos = new THREE.Vector3(); // create once and reuse

    vec.set(
        (event.clientX / width) * 2 - 1,
        - (event.clientY / height) * 2 + 1,
        0.5,
    );

    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    var distance = (width / 4 + cube.position.z - camera.position.z) / vec.z;
    pos.copy(camera.position).add(vec.multiplyScalar(distance));
    return pos
}


let frame = 0
function animate() {
    frame += 0.03
    geometry.setAttribute("displacement", new THREE.BufferAttribute(positions, 1))
    material.uniforms.pointer_direction.value = sphereToPointer;
    material.uniforms.amplitude.value = frame;
    renderer.render(scene, camera);

}
