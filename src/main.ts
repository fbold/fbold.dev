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

init();

// initialize the scene, set all initial positions
// add event listeners
// create geometries and attach meshes
async function init() {
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
    const geometry = new THREE.SphereGeometry(sRadius, 120 * sRadius / 600, 120 * sRadius / 600);

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
    const ring = new THREE.Mesh(geometryRing, new THREE.MeshBasicMaterial({ color: new THREE.Color(0x9f0712) }));
    scene.add(ring)
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
    ring.position.copy(worldPos).add(new THREE.Vector3(radius * pixelsToWorld, radius * pixelsToWorld, 0));
    ring.scale.set(pixelsToWorld, pixelsToWorld, pixelsToWorld);



    // TEXT
    const textGeometry = new TextGeometry("~~~~~~~~~~~~~~~~~~~~~~~~~~~~", {
        font: fonts.ibm,
        size: 7,
        depth: 0.1,
        bevelEnabled: true,
        bevelSegments: 1,
        bevelSize: 0,
        bevelThickness: 1,
    })
    const tMaterial = new THREE.ShaderMaterial({
        uniforms: {
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
    const tVerts = textGeometry.getAttribute("position").count;
    textGeometry.computeBoundingBox()
    const txValues = []
    const vPos = textGeometry.getAttribute("position")
    for (let v = 0; v < tVerts; v++) {
        if (v % 100 === 0)
            console.log(v, vPos.getX(v))
        txValues.push(vPos.getX(v));
    }
    const tX = new Float32Array(txValues);
    const boundingBox = new THREE.Vector3()
    textGeometry.boundingBox.getSize(boundingBox)
    tMaterial.uniforms.length.value = boundingBox.x
    tMaterial.uniforms.radius.value = radius / 10
    console.log(boundingBox.x)

    console.log(tX)
    textGeometry.setAttribute("xPos", new THREE.Float32BufferAttribute(tX, 1))
    // textGeometry.morphAttributes.position.map((ba, index) => {
    //     ba.setX(index, index)
    // })

    const text = new THREE.Mesh(textGeometry, tMaterial);
    text.scale.set(1, 1, 1);
    text.position.copy(worldPos).add(new THREE.Vector3(radius * pixelsToWorld, radius * pixelsToWorld, 0));

    scene.add(text)


    let sphereToPointer = new THREE.Vector3()
    window.addEventListener("mousemove", (e) => {
        const worldPos = windowToWorld(e, depth - 1.1 * radius / 4)
        // sphere pos to mouse pos
        sphereToPointer = worldPos.sub(cube.position)
    })

    // RENDERING AND ANIMATING
    let frame = 0
    let ringPos = new THREE.Vector3()
    let textPos = new THREE.Vector3()

    function animate() {
        frame += 0.01
        geometry.setAttribute("displacement", new THREE.BufferAttribute(positions, 1))
        material.uniforms.pointer_direction.value = sphereToPointer;
        material.uniforms.amplitude.value = frame * 5;


        tMaterial.uniforms.time.value = frame;
        ringPos.copy(cube.position)
        ringPos.add(sphereToPointer.clone().normalize().multiplyScalar(1.4 * radius * pixelsToWorld))
        ring.lookAt(cube.position)
        ring.position.copy(ringPos)
        text.lookAt(cube.position)
        text.rotateOnAxis(new THREE.Vector3(1, 0, 0), -0.5 * Math.PI)
        text.position.copy(ringPos)

        renderer.render(scene, camera);

    }
    //renderer.render(scene, camera);

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
    const font = await loader.loadAsync('/public/fonts/IBMPlexMono-LightItalic.json', function(font) {
    });

    fonts.ibm = font

    return fonts
}

