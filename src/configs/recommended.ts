import type { ESLint, Linter } from 'eslint';

export const PLUGIN_NAME = 'design-tokens';

const RULES: Linter.RulesRecord = {
    'design-tokens/no-hardcoded-colors': 'warn',
    'design-tokens/no-hardcoded-spacing': 'warn',
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
