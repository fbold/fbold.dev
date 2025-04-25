class TechPills extends HTMLElement {

    connectedCallback() {
        const words = (this.getAttribute('words') || '')
            .split(',')
            .map(w => w.trim())
            .filter(Boolean)


        const containerTemplate: HTMLElement | null = document.getElementById('tech-pill-container-template');
        if (!(containerTemplate instanceof HTMLTemplateElement)) return;

        const containerClone = containerTemplate.content.cloneNode(true) as DocumentFragment

        const pillTemplate: HTMLElement | null = document.getElementById('tech-pill-template');
        if (!(pillTemplate instanceof HTMLTemplateElement)) return;


        words.forEach(word => {
            const pillClone = pillTemplate.content.cloneNode(true) as DocumentFragment
            const finishedPill = pillClone.querySelector(".tech-pill")
            if (finishedPill) {
                finishedPill.textContent = word;
                containerClone.querySelector(".tech-pill-container").appendChild(pillClone)
            }
        })

        this.append(containerClone)
    }
}

export const loadWebComponents = () => window.customElements.define('tech-pills', TechPills)


