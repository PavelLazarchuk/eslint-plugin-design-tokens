const LENGTH = /^-?\d*\.?\d+(px|rem|em|pt|%)$/i;
const UNITLESS = /^-?\d*\.?\d+$/;

export const DEFAULT_TYPOGRAPHY_PROPERTIES = [
    'font-size',
    'font-weight',
    'line-height',
    'font-family',
];

export const FONT_FAMILY_PROPERTY = 'font-family';

const FONT_FAMILY_KEYWORDS = new Set(['inherit', 'initial', 'unset', 'revert', 'revert-layer']);

export function isTypographyValue(property: string, value: string): boolean {
    const normalized = value.trim();

    switch (property) {
        case 'font-weight':
            return UNITLESS.test(normalized);
        case 'line-height':
            return UNITLESS.test(normalized) || LENGTH.test(normalized);
        default:
            return LENGTH.test(normalized);
    }
}

export function isFontFamilyValue(value: string): boolean {
    const normalized = value.trim();

    if (normalized === '' || normalized.includes('var(')) return false;
    return !FONT_FAMILY_KEYWORDS.has(normalized.toLowerCase());
}
