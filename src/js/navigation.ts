import { Event } from "three"

export const setupNavigation = () => {
    //@ts-ignore
    if (!window.navigation) window.navigation = {}
    //@ts-ignore
    console.log(window.navigation)
    //@ts-ignore
    window.navigation.to = (location: string) => {
        console.log(location)
    }
}
