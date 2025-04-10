import { Event } from "three"

const menu = document.getElementById("menu")

export const setupNavigation = () => {
    //@ts-ignore
    if (!window.navigation) window.navigation = {}
    //@ts-ignore
    console.log(window.navigation)
    //@ts-ignore
    window.navigation.to = (location: string) => {
        console.log(location)
        menu.classList.add("hide")
    }

    //@ts-ignore
    window.navigation.back = () => {
        menu.classList.remove("hide")
    }
}
