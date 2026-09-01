const VAR_REFERENCE = /var\(\s*(--[^\s,)]+)/g;

export const DEFAULT_TOKEN_PREFIXES: string[] = [];

export const DEFAULT_TOKEN_ALLOWLIST: string[] = [];

export function normalizeVariable(name: string): string {
    return name.trim().replace(/^--/, '').toLowerCase();
}

export function collectVariables(value: string): string[] {
    return [...value.matchAll(VAR_REFERENCE)].flatMap(match => match[1] ?? []);
}

export function isKnownVariable(name: string, prefixes: string[], allowlist: Set<string>): boolean {
    const normalized = normalizeVariable(name);

    if (allowlist.has(normalized)) return true;
    return prefixes.some(prefix => normalized.startsWith(prefix));
}
