const INTEGER = /^[+-]?\d+$/;

export const DEFAULT_ZINDEX_PROPERTIES = ['z-index'];

export const DEFAULT_ZINDEX_ALLOWLIST = ['0', '1', '-1'];

export function isZIndexValue(value: string): boolean {
    return INTEGER.test(value.trim());
}
