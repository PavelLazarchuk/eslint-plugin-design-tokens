import { CSS_WIDE_KEYWORDS, hasVar, tokenizeValue } from './valueTokens';

const TIME = /^-?\d*\.?\d+(s|ms)$/i;
const EASING_FUNCTION = /^(cubic-bezier|steps|linear)\(/i;

export const DEFAULT_TRANSITION_PROPERTIES = [
    'transition',
    'transition-duration',
    'transition-delay',
    'transition-timing-function',
    'animation',
    'animation-duration',
    'animation-delay',
    'animation-timing-function',
];

const EASING_KEYWORDS = new Set([
    'linear',
    'ease',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'step-start',
    'step-end',
]);

function isTimeToken(token: string): boolean {
    return TIME.test(token);
}

function isEasingToken(token: string): boolean {
    return EASING_KEYWORDS.has(token.toLowerCase()) || EASING_FUNCTION.test(token);
}

export function isTransitionValue(value: string): boolean {
    const normalized = value.trim();

    if (normalized === '' || hasVar(normalized)) return false;

    const lowercased = normalized.toLowerCase();
    if (lowercased === 'none' || CSS_WIDE_KEYWORDS.has(lowercased)) return false;

    const tokens = tokenizeValue(normalized);
    return tokens.some(token => isTimeToken(token) || isEasingToken(token));
}
