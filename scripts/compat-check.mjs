/**
 * Runs the built plugin against whichever ESLint the workspace currently has installed, so the
 * `eslint: >=8.57.0` peer range is a promise the CI matrix keeps rather than a hope.
 */
import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import plugin from '../dist/index.js';

const major = Number.parseInt(Linter.version, 10);

const samples = [
    {
        code: 'styled.div`color: #fff;`',
        expected: ['design-tokens/no-hardcoded-colors'],
    },
    {
        code: '<Box sx={{ padding: "8px" }} />',
        expected: ['design-tokens/no-hardcoded-spacing'],
    },
    {
        code: 'const styles = { zIndex: 1300 };\n<Box sx={styles} />;',
        expected: ['design-tokens/no-hardcoded-z-index'],
    },
];

function verifyFlat(code, config) {
    return new Linter().verify(
        code,
        [
            ...plugin.configs[`flat/${config}`],
            {
                languageOptions: {
                    ecmaVersion: 2022,
                    sourceType: 'module',
                    parserOptions: { ecmaFeatures: { jsx: true } },
                },
            },
        ],
        'example.js'
    );
}

function verifyLegacy(code, config) {
    const linter = new Linter({ configType: 'eslintrc' });

    for (const [name, rule] of Object.entries(plugin.rules))
        linter.defineRule(`design-tokens/${name}`, rule);

    return linter.verify(code, {
        parserOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            ecmaFeatures: { jsx: true },
        },
        rules: plugin.configs[config].rules,
    });
}

const verify = major >= 9 ? verifyFlat : verifyLegacy;

for (const { code, expected } of samples) {
    // `recommended` warns, `strict` and `all` report the same rules as errors.
    for (const [config, severity] of [
        ['recommended', 1],
        ['strict', 2],
        ['all', 2],
    ]) {
        const messages = verify(code, config);

        assert.deepEqual(
            messages.map(message => message.ruleId),
            expected,
            `ESLint ${Linter.version} reported ${JSON.stringify(messages)} for ${code} under ${config}`
        );
        assert.ok(
            messages.every(message => message.severity === severity),
            `ESLint ${Linter.version} did not apply the ${config} severity for ${code}`
        );
    }
}

console.log(`ESLint ${Linter.version}: ${samples.length} samples reported as expected.`);
