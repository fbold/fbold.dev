
/////////////////////////////////
// TEXT
/////////////////////////////////

import * as THREE from "three"
import { Font, TextGeometry } from "three/examples/jsm/Addons.js"
import * as textShader from "../shaders/circulartext.glsl.js"

interface CreateTextRingParams {
    content: string,
    font: Font,
    ringRadius: number,
    sphereRadius: number,
    position: THREE.Vector3,
    relativeHeight?: number,
    pixelsToWorld: number,
    /* As a proportion of radius */
    extensionLimit: number
}
interface MyText extends THREE.Mesh {
    onAnimate?: (delta: number, spherePos: THREE.Vector3, sphereToPointer: THREE.Vector3, extrusion: number) => void
}

export function createTextRing({
    content,
    font,
    ringRadius,
    sphereRadius,
    position,
    relativeHeight,
    pixelsToWorld,
    extensionLimit
}: CreateTextRingParams): MyText {
    const textGeometry = new TextGeometry(content, {
        font: font,
        size: Math.round(sphereRadius * 0.05),
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
            sRadius: {
                value: THREE.FloatType,
            },
            scale: {
                value: THREE.FloatType,
            },
            time: {
                value: THREE.FloatType,
            },
            extrusion: {
                value: THREE.FloatType
            },
            extensionLimit: {
                value: THREE.FloatType
            },
        },
        vertexShader: textShader.vertex,
        fragmentShader: textShader.fragment
    })

    // want to pass through the x position of every vertex
    // so it can be used with total length to find angular position
    const tVerts = textGeometry.getAttribute("position")
    const txValues = []
    for (let v = 0; v < tVerts.count; v++) {
        txValues.push(tVerts.getX(v))
    }
    const tX = new Float32Array(txValues)

    // This is to find total length of text mesh
    const boundingBox = new THREE.Vector3()
    textGeometry.computeBoundingBox()
    textGeometry.boundingBox.getSize(boundingBox)
    tMaterial.uniforms.length.value = boundingBox.x;
    tMaterial.uniforms.radius.value = ringRadius * pixelsToWorld;
    tMaterial.uniforms.sRadius.value = sphereRadius * pixelsToWorld;
    tMaterial.uniforms.scale.value = pixelsToWorld;
    tMaterial.uniforms.extensionLimit.value = extensionLimit;
    tMaterial.uniforms.meshStart.value = tVerts.getZ(0)

    textGeometry.setAttribute("xPos", new THREE.Float32BufferAttribute(tX, 1))

    // POSITIONING TEXT RING
    const text: MyText = new THREE.Mesh(textGeometry, tMaterial);
    // text.position.copy(position).add(new THREE.Vector3(ringRadius * pixelsToWorld, ringRadius * pixelsToWorld, 0));
    text.scale.set(pixelsToWorld, pixelsToWorld, pixelsToWorld)

    const textPos = new THREE.Vector3()
    const rotationVector = new THREE.Vector3(-1, 0, 0)
    text.onAnimate = (delta, spherePos, sphereToPointer, extrusion) => {
        textPos.copy(spherePos)
        textPos.add(sphereToPointer.clone().multiplyScalar(sphereRadius * pixelsToWorld).multiplyScalar(relativeHeight || 1))
        // @ts-ignore
        text.material.uniforms.time.value += delta * 0.5// * (0.2 + extrusion / 100);
        // @ts-ignore
        text.material.uniforms.extrusion.value = extrusion
        text.lookAt(spherePos)
        text.rotateOnAxis(rotationVector, 0.5 * Math.PI)
        text.position.copy(textPos)
    }

    return text
}
