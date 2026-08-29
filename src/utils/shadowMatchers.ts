import { isColorValue } from './colorMatchers';

const LENGTH = /^-?\d*\.?\d+(px|rem|em)$/i;
const ZERO = /^-?0+(\.0+)?$/;

export const DEFAULT_SHADOW_PROPERTIES = ['box-shadow', 'text-shadow'];

const SHADOW_KEYWORDS = new Set(['none', 'inherit', 'initial', 'unset', 'revert']);

function isLength(token: string): boolean {
    return LENGTH.test(token) || ZERO.test(token);
}

function splitTopLevel(value: string, separator: string): string[] {
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

function tokenize(layer: string): string[] {
    return splitTopLevel(layer.replace(/\s+/g, ' '), ' ');
}

function isShadowLayer(layer: string): boolean {
    const tokens = tokenize(layer);

    let lengths = 0;
    let colors = 0;

    for (const token of tokens) {
        if (token.toLowerCase() === 'inset') continue;
        if (isLength(token)) {
            lengths += 1;
            continue;
        }
        if (isColorValue(token)) {
            colors += 1;
            continue;
        }

        return false;
    }

    return lengths >= 2 || (lengths >= 1 && colors >= 1);
}

export function isShadowValue(value: string): boolean {
    const normalized = value.trim();

    if (normalized === '' || normalized.includes('var(')) return false;
    if (SHADOW_KEYWORDS.has(normalized.toLowerCase())) return false;

    const layers = splitTopLevel(normalized, ',');

    return layers.length > 0 && layers.some(isShadowLayer);
}
