class TechPills extends HTMLElement {

    connectedCallback() {
        const words = (this.getAttribute('words') || '')
            .split(',')
            .map(w => w.trim())
            .filter(Boolean)

        console.log("wordsss", words)

        const container = document.getElementById("tech-pill-container-template").content
        const containerClone = container.cloneNode(true)
        const pill = document.getElementById("tech-pill-template").content

        words.forEach(word => {
            const pillClone = pill.cloneNode(true)
            const finishedPill = pillClone.querySelector(".tech-pill")
            console.log("finished pill", finishedPill)
            finishedPill.textContent = word
            console.log("container clone ocntainer", containerClone.querySelector(".tech-pill-container"))
            containerClone.querySelector(".tech-pill-container").appendChild(pillClone)
        })

        this.append(containerClone)
    }
}

export const loadWebComponents = () => window.customElements.define('tech-pills', TechPills)


