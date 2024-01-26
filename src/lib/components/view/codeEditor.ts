
export function renderSemanticTokens(content: string, semanticTokens: number[]): HTMLElement {
    const base = createBaseDiv();
    base.innerText = "Test";
    return base;
}

export function renderPlainText(line: string): HTMLElement {
    const lineDiv = document.createElement("div");
    lineDiv.classList.add("code-line");
    
    const span = document.createElement("span");
    span.innerText = line;
    
    lineDiv.appendChild(span);
    lineDiv.appendChild(document.createElement("br"));
    
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
