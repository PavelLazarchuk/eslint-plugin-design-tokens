import type { ESLint } from 'eslint';
import noHardcodedColors from './rules/no-hardcoded-colors';
import noHardcodedSpacing from './rules/no-hardcoded-spacing';
import { flatRecommended, legacyRecommended } from './configs/recommended';

declare const __PLUGIN_VERSION__: string;

const plugin: ESLint.Plugin = {
    meta: { name: 'eslint-plugin-design-tokens', version: __PLUGIN_VERSION__ },
    rules: {
        'no-hardcoded-colors': noHardcodedColors,
        'no-hardcoded-spacing': noHardcodedSpacing,
    },
};

plugin.configs = {
    recommended: legacyRecommended,
    'flat/recommended': flatRecommended(plugin),
};

export default plugin;
