const LENGTH = /^-?\d*\.?\d+(px|rem|em)$/i;
const ZERO = /^-?0+(\.0+)?$/;

export const CSS_WIDE_KEYWORDS = new Set(['inherit', 'initial', 'unset', 'revert', 'revert-layer']);

export function hasVar(value: string): boolean {
    return value.includes('var(');
}

export function splitTopLevel(value: string, separator: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let current = '';

    for (const character of value) {
        if (character === '(') depth += 1;
        else if (character === ')') depth = Math.max(0, depth - 1);

        if (character === separator && depth === 0) {
            parts.push(current);
            current = '';
            continue;
        }
        current += character;
    }
    parts.push(current);

    return parts.map(part => part.trim()).filter(part => part !== '');
}

export function splitLayers(value: string): string[] {
    return splitTopLevel(value, ',');
}

export function tokenize(layer: string): string[] {
    return splitTopLevel(layer.replace(/\s+/g, ' '), ' ');
}

export function tokenizeValue(value: string): string[] {
    return splitLayers(value).flatMap(tokenize);
}

export function isLength(token: string): boolean {
    return LENGTH.test(token);
}

export function isZero(token: string): boolean {
    return ZERO.test(token);
}
