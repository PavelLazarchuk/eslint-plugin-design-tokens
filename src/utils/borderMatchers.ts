import { isColorValue } from './colorMatchers';
import { CSS_WIDE_KEYWORDS, hasVar, isLength, isZero, splitLayers, tokenize } from './valueTokens';

export const DEFAULT_BORDER_PROPERTIES = [
    'border',
    'border-top',
    'border-right',
    'border-bottom',
    'border-left',
    'border-inline',
    'border-block',
    'border-width',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'outline',
    'outline-width',
];

const BORDER_STYLES = new Set([
    'none',
    'hidden',
    'solid',
    'dashed',
    'dotted',
    'double',
    'groove',
    'ridge',
    'inset',
    'outset',
    'auto',
]);

const WIDTH_KEYWORDS = new Set(['thin', 'medium', 'thick']);

function isBorderLayer(layer: string): boolean {
    const tokens = tokenize(layer);

    let widths = 0;
    let colors = 0;

    for (const token of tokens) {
        const lowercased = token.toLowerCase();

        if (BORDER_STYLES.has(lowercased) || isZero(token)) continue;
        if (isLength(token) || WIDTH_KEYWORDS.has(lowercased)) {
            widths += 1;
            continue;
        }
        if (isColorValue(token)) {
            colors += 1;
            continue;
        }
        return false;
    }

    return widths >= 1 || colors >= 1;
}

export function isBorderValue(value: string): boolean {
    const normalized = value.trim();

    if (normalized === '' || hasVar(normalized)) return false;
    if (CSS_WIDE_KEYWORDS.has(normalized.toLowerCase())) return false;

    const layers = splitLayers(normalized);
    return layers.length > 0 && layers.every(isBorderLayer);
}
