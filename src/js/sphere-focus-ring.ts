
/////////////////////////////////
// TEXT
/////////////////////////////////

import * as THREE from "three"
import { Font, TextGeometry } from "three/examples/jsm/Addons.js"
import * as textShader from "../shaders/circulartext.glsl.js"

type CreateTextRingParams = { content: string, font: Font, ringRadius: number, sphereRadius: number, position: THREE.Vector3, pixelsToWorld: number }
export function createTextRing({ content, font, ringRadius, sphereRadius, position, pixelsToWorld }: CreateTextRingParams): THREE.Mesh {
    //const textGeometry = new TextGeometry("==============================", {
    // const textGeometry = new TextGeometry("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", {
    //const textGeometry = new TextGeometry("00000000000000000000000000000000000000000000000000000000", {
    const textGeometry = new TextGeometry(content, {
        font: font,
        size: 12,
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
    tMaterial.uniforms.radius.value = pixelsToWorld * ringRadius;
    tMaterial.uniforms.sRadius.value = sphereRadius;
    tMaterial.uniforms.scale.value = pixelsToWorld;
    tMaterial.uniforms.meshStart.value = tVerts.getZ(0)

    textGeometry.setAttribute("xPos", new THREE.Float32BufferAttribute(tX, 1))

    // POSITIONING TEXT RING
    const text = new THREE.Mesh(textGeometry, tMaterial);
    text.position.copy(position).add(new THREE.Vector3(ringRadius * pixelsToWorld, ringRadius * pixelsToWorld, 0));
    text.scale.set(pixelsToWorld, pixelsToWorld, pixelsToWorld)

    return text
}
