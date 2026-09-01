import type { ESLint, Linter } from 'eslint';

export const PLUGIN_NAME = 'design-tokens';

const RECOMMENDED_RULES = [
    'no-hardcoded-colors',
    'no-hardcoded-spacing',
    'no-hardcoded-typography',
    'no-hardcoded-shadows',
    'no-hardcoded-radius',
    'no-hardcoded-borders',
    'no-hardcoded-transitions',
    'no-hardcoded-z-index',
    'no-unknown-token-var',
];

function ruleRecord(names: string[], severity: Linter.StringSeverity): Linter.RulesRecord {
    return Object.fromEntries(names.map(name => [`${PLUGIN_NAME}/${name}`, severity]));
}

function everyRule(plugin: ESLint.Plugin): string[] {
    return Object.keys(plugin.rules ?? {});
}

/** `.eslintrc` forms — referenced through `extends: ['plugin:design-tokens/<name>']`. */
export function legacyConfigs(plugin: ESLint.Plugin): Record<string, Linter.LegacyConfig> {
    return {
        recommended: { plugins: [PLUGIN_NAME], rules: ruleRecord(RECOMMENDED_RULES, 'warn') },
        strict: { plugins: [PLUGIN_NAME], rules: ruleRecord(RECOMMENDED_RULES, 'error') },
        all: { plugins: [PLUGIN_NAME], rules: ruleRecord(everyRule(plugin), 'error') },
    };
}

/** Flat-config forms — spread into `eslint.config.js`. */
export function flatConfigs(plugin: ESLint.Plugin): Record<string, Linter.Config[]> {
    const flat = (names: string[], severity: Linter.StringSeverity): Linter.Config[] => [
        { plugins: { [PLUGIN_NAME]: plugin }, rules: ruleRecord(names, severity) },
    ];

    return {
        'flat/recommended': flat(RECOMMENDED_RULES, 'warn'),
        'flat/strict': flat(RECOMMENDED_RULES, 'error'),
        'flat/all': flat(everyRule(plugin), 'error'),
    };
}
