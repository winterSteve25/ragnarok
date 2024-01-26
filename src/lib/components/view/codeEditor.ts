
export function renderSemanticTokens(content: string, semanticTokens: number[]): HTMLElement {
    const base = createBaseDiv();
    base.innerText = "Test";
    return base;
}

export function renderPlainText(line: string): HTMLElement {
    const lineDiv = document.createElement("div");
    lineDiv.classList.add("code-line");

    line.split(" ").forEach((token) => {
        const span = document.createElement("span");
        span.innerText = token ? token : "\u00A0";
        lineDiv.appendChild(span);
        if (token) {
            lineDiv.appendChild(createWhitespace());
        }
    });

    if (lineDiv.lastChild) {
        lineDiv.removeChild(lineDiv.lastChild);
    }

    if (!lineDiv.hasChildNodes()) {
        lineDiv.appendChild(document.createElement("br"));
    }

    return lineDiv;
}

function createBaseDiv(): HTMLDivElement {
    const div = document.createElement("div");

    div.style.setProperty("display", "flex");
    div.style.setProperty("flex-direction", "column");
    div.classList.add("code-lines");

    return div;
}

function createWhitespace(): HTMLSpanElement {
    const span = document.createElement("span");
    span.innerText = "\u00A0";
    return span;
}
