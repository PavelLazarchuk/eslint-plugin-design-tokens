import type { ESLint } from 'eslint';
import noHardcodedColors from './rules/no-hardcoded-colors';
import noHardcodedSpacing from './rules/no-hardcoded-spacing';
import noHardcodedTypography from './rules/no-hardcoded-typography';
import noHardcodedShadows from './rules/no-hardcoded-shadows';
import noHardcodedRadius from './rules/no-hardcoded-radius';
import noHardcodedBorders from './rules/no-hardcoded-borders';
import noHardcodedTransitions from './rules/no-hardcoded-transitions';
import noHardcodedZIndex from './rules/no-hardcoded-z-index';
import noUnknownTokenVar from './rules/no-unknown-token-var';
import { flatConfigs, legacyConfigs } from './configs';

declare const __PLUGIN_VERSION__: string;

const plugin: ESLint.Plugin = {
    meta: { name: 'eslint-plugin-design-tokens', version: __PLUGIN_VERSION__ },
    rules: {
        'no-hardcoded-colors': noHardcodedColors,
        'no-hardcoded-spacing': noHardcodedSpacing,
        'no-hardcoded-typography': noHardcodedTypography,
        'no-hardcoded-shadows': noHardcodedShadows,
        'no-hardcoded-radius': noHardcodedRadius,
        'no-hardcoded-borders': noHardcodedBorders,
        'no-hardcoded-transitions': noHardcodedTransitions,
        'no-hardcoded-z-index': noHardcodedZIndex,
        'no-unknown-token-var': noUnknownTokenVar,
    },
};

plugin.configs = { ...legacyConfigs(plugin), ...flatConfigs(plugin) };

export default plugin;
