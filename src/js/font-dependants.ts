import { Object3D, Vector3 } from "three"
import { Font, FontLoader, TTFLoader } from "three/examples/jsm/Addons.js"
import { createOrbitalText, OrbitalTextObject } from "./orbital-text"

type FontDependantDependencies = {
    sRadius: number,
    pixelsToWorld: number,
    sphere: Object3D

}

export type FontDependants = {
    textRing: OrbitalTextObject
}

function onFontsLoaded(fonts: Fonts, props: FontDependantDependencies): FontDependants {
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

    //const textRingContent = "☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺☺"
    // const textRingContent = "bold.dev ⁂ fbold.dev ⁂ fbold.dev ⁂ fbold.dev ⁂ fbold.dev ⁂ fbold.dev ⁂ fbold.dev ⁂ fbold.dev ⁂ fbold.dev ⁂ fbold.dev ⁂ fbold.dev ⁂ fbold.dev ⁂ fbold.dev ⁂ fbold.dev ⁂ fbold.dev ⁂ f"
    const textRingContent = ", welcome to my website ☺ hello, welcome to my website ☺ hello, welcome to my website ☺ hello, welcome to my website ☺ hello, welcome to my website ☺ hello"
    const textRing = createOrbitalText({
        content: textRingContent,
        font: fonts.absans,
        ringRadius: props.sRadius,
        sphereRadius: props.sRadius,
        pixelsToWorld: props.pixelsToWorld,
    })

    textRing.position.copy(props.sphere.position.clone().add(new Vector3(0, 0, 0)))
    textRing.position.add(new Vector3(0 * props.sRadius * props.pixelsToWorld * 0.5, 0.1 * props.sRadius * props.pixelsToWorld, 0))

    return {
        textRing
    }
}

export const loadFontDependants = async (): Promise<(FontDependantDependencies) => FontDependants> => {

    // TODO synchronously loading fonts, should change
    console.log("loading fonts")
    const fonts = await loadFonts()

    return (props) => onFontsLoaded(fonts, props)

}



type Fonts = {
    [name: string]: any
}


async function loadFonts(): Promise<Fonts> {
    const loader = new TTFLoader();
    //const loader = new Loader();

    const fonts: Fonts = {}
    //const fontAbsans = await loader.loadAsync('/this was the json one', function(font) {
    const fontAbsans = await loader.loadAsync('/fonts/CLT Absans/desktop/Absans-Regular.otf', function(font) {
    });

    // const fontIBM = await loader.loadAsync('/public/fonts/IBMPlexMono-LightItalic.json', function(font) {
    // });

    fonts.absans = new Font(fontAbsans,)
    // fonts.ibm = fontIBM

    return fonts
}

