/////////////////////////////////
// TEXT
/////////////////////////////////

import * as THREE from "three"
import { Font, TextGeometry } from "three/examples/jsm/Addons.js"
import * as textShader from "../shaders/orbital-text.glsl.js"

interface CreateTextRingParams {
    content: string,
    font: Font,
    ringRadius: number,
    sphereRadius: number,
    pixelsToWorld: number,
}

export interface OrbitalTextObject extends THREE.Mesh {
    onAnimate?: (delta: number, extrusion: number) => void
}

export function createOrbitalText({
    content,
    font,
    ringRadius,
    sphereRadius,
    pixelsToWorld,
}: CreateTextRingParams): OrbitalTextObject {
    const textGeometry = new TextGeometry(content, {
        font: font,
        size: Math.round(sphereRadius * 0.05),
        bevelEnabled: true,
        depth: 1,
        bevelSize: 0,
        steps: 2,
        bevelThickness: 0,
    })

    const tMaterial = new THREE.ShaderMaterial({
        uniforms: {
            meshStart: {
                value: THREE.FloatType,
            },
            meshStartY: {
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
    tMaterial.uniforms.radius.value = ringRadius;
    tMaterial.uniforms.sRadius.value = sphereRadius * pixelsToWorld;
    tMaterial.uniforms.scale.value = pixelsToWorld;
    tMaterial.uniforms.meshStart.value = tVerts.getZ(0)
    tMaterial.uniforms.meshStartY.value = tVerts.getY(0)

    textGeometry.setAttribute("xPos", new THREE.Float32BufferAttribute(tX, 1))

    // POSITIONING TEXT RING
    const text: OrbitalTextObject = new THREE.Mesh(textGeometry, tMaterial);
    // text.position.copy(position).add(new THREE.Vector3(ringRadius * pixelsToWorld, ringRadius * pixelsToWorld, 0));
    text.scale.set(pixelsToWorld, pixelsToWorld, pixelsToWorld)

    text.onAnimate = (delta, extrusion) => {
        // @ts-ignore
        text.material.uniforms.time.value += delta * 0.5// * (0.2 + extrusion / 100);
    }

    return text
}
