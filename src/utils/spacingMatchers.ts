const SPACING_VALUE = /^-?\d*\.?\d+(px|rem|em)$/i;

export const DEFAULT_SPACING_PROPERTIES = [
    'margin',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'gap',
    'row-gap',
    'column-gap',
    'top',
    'right',
    'bottom',
    'left',
];

export function isSpacingValue(value: string): boolean {
    return SPACING_VALUE.test(value.trim());
}
