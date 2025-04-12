import { Event } from "three"

const menu = document.getElementById("menu")
const projects = document.getElementById("projects")

export const setupNavigation = () => {
    //@ts-ignore
    if (!window.navigation) window.navigation = {}
    //@ts-ignore
    console.log(window.navigation)
    //@ts-ignore
    window.navigation.to = (location: string) => {
        console.log(location)
        menu.classList.add("hide")

        if (location === "projects")
            projects.classList.add("show")
    }

    //@ts-ignore
    window.navigation.back = () => {
        menu.classList.remove("hide")
        projects.classList.remove("show")
    }
}
