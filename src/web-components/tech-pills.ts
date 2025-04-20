class TechPills extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const words = (this.getAttribute('words') || '')
            .split(',')
            .map(w => w.trim())
            .filter(Boolean);

        console.log("wordsss", words)

        const container = document.createElement('div');

        words.forEach(word => {
            const span = document.createElement('span');
            span.textContent = word;
            container.appendChild(span);
        });

        this.shadowRoot.append(container);
    }
}

export const loadWebComponents = () => window.customElements.define('tech-pills', TechPills);


