
export function renderSemanticTokens(content: string, semanticTokens: number[]): HTMLElement {
}

export function renderPlainText(line: string): HTMLElement {
    const span = document.createElement("span");
    span.innerText = line;
    return span;
}