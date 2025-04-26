export class ProjectCard extends HTMLElement {

    connectedCallback() {
        const projectTemplate: HTMLElement | null = document.getElementById('project-card-template');
        if (!(projectTemplate instanceof HTMLTemplateElement)) return;

        const clone = projectTemplate.content.cloneNode(true) as DocumentFragment

        let wipText: null | HTMLSpanElement
        if (this.getAttribute("wip") == "") {
            clone.querySelector(".row")?.classList.add("border-2", "border-dashed", "border-stone-700")
            wipText = document.createElement('span')
            wipText.classList.add("ml-auto", "text-2xl")
            wipText.textContent = "[WIP]"
            console.log(wipText)
        }


        clone.querySelector("a").href = this.getAttribute("link")
        clone.querySelector("a").textContent = this.getAttribute("title") + "↗"
        if (wipText) clone.querySelector("a").appendChild(wipText)

        clone.querySelector(".description").textContent = this.textContent
        this.textContent = ""

        console.log(clone.querySelector("tech-pills"))
        clone.querySelector(".tech-pills").setAttribute("words", this.getAttribute("tech-words"))

        this.append(clone)
    }
}



