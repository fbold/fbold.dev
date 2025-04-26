import { TechPills } from "./tech-pills"
import { ProjectCard } from "./project-card"

export const loadWebComponents = () => {
    window.customElements.define('tech-pills', TechPills)
    window.customElements.define('project-card', ProjectCard)
}

