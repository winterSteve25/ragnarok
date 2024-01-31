
export function renderSemanticTokens(content: string, semanticTokens: number[]): HTMLElement {
    return null;
}

export function renderPlainText(line: string): HTMLElement {
    const span = document.createElement("span");
    span.innerText = line;
    return span;
}