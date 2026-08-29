import type { ESLint } from 'eslint';
import noHardcodedColors from './rules/no-hardcoded-colors';
import noHardcodedSpacing from './rules/no-hardcoded-spacing';
import noHardcodedTypography from './rules/no-hardcoded-typography';
import noHardcodedShadows from './rules/no-hardcoded-shadows';
import noHardcodedRadius from './rules/no-hardcoded-radius';
import { flatRecommended, legacyRecommended } from './configs/recommended';

declare const __PLUGIN_VERSION__: string;

const plugin: ESLint.Plugin = {
    meta: { name: 'eslint-plugin-design-tokens', version: __PLUGIN_VERSION__ },
    rules: {
        'no-hardcoded-colors': noHardcodedColors,
        'no-hardcoded-spacing': noHardcodedSpacing,
        'no-hardcoded-typography': noHardcodedTypography,
        'no-hardcoded-shadows': noHardcodedShadows,
        'no-hardcoded-radius': noHardcodedRadius,
    },
};

plugin.configs = {
    recommended: legacyRecommended,
    'flat/recommended': flatRecommended(plugin),
};

export default plugin;
