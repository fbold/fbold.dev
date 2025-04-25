
const menu = document.getElementById("menu")
const siteTitle = document.getElementById("site-title")
const typefaceLink = document.getElementById("typeface-link")
const projects = document.getElementById("projects")
const contact = document.getElementById("contact")

export const setupNavigation = () => {
    //@ts-ignore
    if (!window.navigation) window.navigation = {}
    //@ts-ignore
    window.navigation.to = (location: string) => {
        menu.classList.add("hide")
        siteTitle.classList.add("hide")
        typefaceLink.classList.add("hide")


        if (location === "projects") {
            projects.classList.add("show")
            setTimeout(() => projects.classList.remove("fixed"), 600)
            projects.classList.add("absolute")
        } if (location === "contact") {
            contact.classList.add("show")
            contact.classList.remove("!fixed")
            contact.classList.add("absolute")
        }
    }

    //@ts-ignore
    window.navigation.back = () => {
        menu.classList.remove("hide")
        siteTitle.classList.remove("hide")
        typefaceLink.classList.remove("hide")

        projects.classList.remove("show")
        projects.classList.add("fixed")
        projects.classList.add("absolute")
        contact.classList.remove("show")
        contact.classList.add("fixed")
        contact.classList.add("absolute")
    }
}
