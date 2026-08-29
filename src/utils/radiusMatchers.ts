const RADIUS_VALUE = /^-?\d*\.?\d+(px|rem|em|%)$/i;

export const DEFAULT_RADIUS_PROPERTIES = [
    'border-radius',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
    'border-start-start-radius',
    'border-start-end-radius',
    'border-end-start-radius',
    'border-end-end-radius',
];

export function isRadiusValue(value: string): boolean {
    const parts = value
        .trim()
        .split(/[\s/]+/)
        .filter(Boolean);

    if (parts.length === 0 || parts.length > 8) return false;
    return parts.every(part => RADIUS_VALUE.test(part));
}
