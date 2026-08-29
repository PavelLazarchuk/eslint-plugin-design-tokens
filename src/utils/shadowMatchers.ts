import { isColorValue } from './colorMatchers';
import { CSS_WIDE_KEYWORDS, hasVar, isLength, isZero, splitLayers, tokenize } from './valueTokens';

export const DEFAULT_SHADOW_PROPERTIES = ['box-shadow', 'text-shadow'];

function isShadowLayer(layer: string): boolean {
    const tokens = tokenize(layer);

    let lengths = 0;
    let colors = 0;

    for (const token of tokens) {
        if (token.toLowerCase() === 'inset') continue;
        if (isLength(token) || isZero(token)) {
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

    if (normalized === '' || hasVar(normalized)) return false;

    const lowercased = normalized.toLowerCase();
    if (lowercased === 'none' || CSS_WIDE_KEYWORDS.has(lowercased)) return false;

    const layers = splitLayers(normalized);
    return layers.length > 0 && layers.some(isShadowLayer);
}
