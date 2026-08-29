import type { ESLint, Linter } from 'eslint';

export const PLUGIN_NAME = 'design-tokens';

const RULES: Linter.RulesRecord = {
    'design-tokens/no-hardcoded-colors': 'warn',
    'design-tokens/no-hardcoded-spacing': 'warn',
    'design-tokens/no-hardcoded-typography': 'warn',
    'design-tokens/no-hardcoded-shadows': 'warn',
    'design-tokens/no-hardcoded-radius': 'warn',
};

/** `.eslintrc` form — referenced through `extends: ['plugin:design-tokens/recommended']`. */
export const legacyRecommended = {
    plugins: [PLUGIN_NAME],
    rules: { ...RULES },
};

/** Flat-config form — spread into `eslint.config.js`. */
export function flatRecommended(plugin: ESLint.Plugin): Linter.Config[] {
    return [
        {
            plugins: { [PLUGIN_NAME]: plugin },
            rules: { ...RULES },
        },
    ];
}
