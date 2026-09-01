import { describe, expect, it } from 'vitest';
import { Linter } from 'eslint';
import plugin from '../src/index';

function legacyRules(name: string): Partial<Linter.RulesRecord> {
    return (plugin.configs?.[name] as Linter.LegacyConfig).rules ?? {};
}

function flatRules(name: string): Partial<Linter.RulesRecord> {
    const [config] = plugin.configs?.[`flat/${name}`] as Linter.Config[];
    return config?.rules ?? {};
}

describe('plugin', () => {
    it('exposes every rule', () => {
        expect(Object.keys(plugin.rules ?? {})).toEqual([
            'no-hardcoded-colors',
            'no-hardcoded-spacing',
            'no-hardcoded-typography',
            'no-hardcoded-shadows',
            'no-hardcoded-radius',
            'no-hardcoded-borders',
            'no-hardcoded-transitions',
            'no-hardcoded-z-index',
            'no-unknown-token-var',
        ]);
    });

    it.each(['recommended', 'strict', 'all'])('lists every rule in the %s configs', name => {
        const expected = Object.keys(plugin.rules ?? {})
            .map(rule => `design-tokens/${rule}`)
            .sort();

        expect(Object.keys(legacyRules(name)).sort()).toEqual(expected);
        expect(Object.keys(flatRules(name)).sort()).toEqual(expected);
    });

    it.each([
        ['recommended', 'warn'],
        ['strict', 'error'],
        ['all', 'error'],
    ])('the %s configs set every rule to %s', (name, severity) => {
        expect(Object.values(legacyRules(name))).toSatisfy((severities: unknown[]) =>
            severities.every(entry => entry === severity)
        );
        expect(Object.values(flatRules(name))).toSatisfy((severities: unknown[]) =>
            severities.every(entry => entry === severity)
        );
    });

    it('marks a rule as recommended exactly when the recommended config has it', () => {
        const recommended = new Set(Object.keys(legacyRules('recommended')));

        for (const [name, rule] of Object.entries(plugin.rules ?? {})) {
            const meta = typeof rule === 'object' ? rule.meta : undefined;
            expect(meta?.docs?.recommended).toBe(recommended.has(`design-tokens/${name}`));
        }
    });

    it('declares the defaults of every rule as defaultOptions', () => {
        for (const rule of Object.values(plugin.rules ?? {})) {
            const meta = typeof rule === 'object' ? rule.meta : undefined;
            const [defaults] = (meta?.defaultOptions ?? []) as Record<string, unknown>[];

            expect(defaults).toMatchObject({ allowlistPatterns: [] });
        }
    });

    it('points every rule at its own docs page', () => {
        for (const [name, rule] of Object.entries(plugin.rules ?? {})) {
            const url = typeof rule === 'object' ? rule.meta?.docs?.url : undefined;
            expect(url).toBe(
                `https://github.com/PavelLazarchuk/eslint-plugin-design-tokens/blob/main/docs/rules/${name}.md`
            );
        }
    });

    it.each(['recommended', 'strict', 'all'])('ships a legacy and a flat %s config', name => {
        expect(plugin.configs?.[name]).toMatchObject({ plugins: ['design-tokens'] });
        expect(Array.isArray(plugin.configs?.[`flat/${name}`])).toBe(true);
    });

    it('names the option when a pattern will not compile', () => {
        expect(() =>
            new Linter().verify(
                'styled.div`color: #fff;`',
                [
                    ...(plugin.configs!['flat/recommended'] as Linter.Config[]),
                    {
                        languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
                        rules: {
                            'design-tokens/no-hardcoded-colors': [
                                'warn',
                                { allowlistPatterns: ['('] },
                            ],
                        },
                    },
                ],
                'example.js'
            )
        ).toThrow(/Invalid regular expression in "allowlistPatterns": \(/);
    });

    it('reports as errors through the flat strict config', () => {
        const messages = new Linter().verify(
            'styled.div`color: #fff;`',
            [
                ...(plugin.configs!['flat/strict'] as Linter.Config[]),
                { languageOptions: { ecmaVersion: 2022, sourceType: 'module' } },
            ],
            'example.js'
        );

        expect(messages.map(message => message.ruleId)).toEqual([
            'design-tokens/no-hardcoded-colors',
        ]);
        expect(messages.every(message => message.severity === 2)).toBe(true);
    });

    it('reports through the flat recommended config', () => {
        const messages = new Linter().verify(
            'styled.div`color: #fff; padding: 8px; font-size: 14px; box-shadow: 0 1px 2px #000; border-radius: 4px; border: 1px solid #fff; transition: all 0.3s ease; z-index: 1300;`',
            [
                ...(plugin.configs!['flat/recommended'] as Linter.Config[]),
                { languageOptions: { ecmaVersion: 2022, sourceType: 'module' } },
            ],
            'example.js'
        );

        expect(messages.map(message => message.ruleId)).toEqual([
            'design-tokens/no-hardcoded-colors',
            'design-tokens/no-hardcoded-spacing',
            'design-tokens/no-hardcoded-typography',
            'design-tokens/no-hardcoded-shadows',
            'design-tokens/no-hardcoded-radius',
            'design-tokens/no-hardcoded-borders',
            'design-tokens/no-hardcoded-transitions',
            'design-tokens/no-hardcoded-z-index',
        ]);
        expect(messages.every(message => message.severity === 1)).toBe(true);
    });
});
