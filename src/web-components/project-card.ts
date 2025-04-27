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

        console.log(this.getAttribute("link"))
        if (this.getAttribute("link") !== "") {
            clone.querySelector("a").href = this.getAttribute("link")
            clone.querySelector("a").textContent = this.getAttribute("title") + "↗"
        } else {
            const replacement = document.createElement("h3")
            replacement.className = clone.querySelector(".title").className
            replacement.classList.remove("hover:text-red-700", "transition-colors")
            clone.querySelector(".title").replaceWith(replacement)
            clone.querySelector(".title").textContent = this.getAttribute("title")
        }

        if (wipText) clone.querySelector(".title").appendChild(wipText)

        clone.querySelector(".description").innerHTML = this.innerHTML
        this.textContent = ""

        console.log(clone.querySelector("tech-pills"))
        clone.querySelector(".tech-pills").setAttribute("words", this.getAttribute("tech-words"))

        this.append(clone)
    }
}



