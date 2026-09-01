import { describe, expect, it } from 'vitest';
import { Linter } from 'eslint';
import plugin from '../src/index';

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

    it('lists every rule in every config', () => {
        const expected = Object.keys(plugin.rules ?? {})
            .map(name => `design-tokens/${name}`)
            .sort();

        const legacy = plugin.configs?.recommended as Linter.Config;
        const [flat] = plugin.configs?.['flat/recommended'] as Linter.Config[];

        expect(Object.keys(legacy.rules ?? {}).sort()).toEqual(expected);
        expect(Object.keys(flat?.rules ?? {}).sort()).toEqual(expected);
    });

    it('points every rule at its own docs page', () => {
        for (const [name, rule] of Object.entries(plugin.rules ?? {})) {
            const url = typeof rule === 'object' ? rule.meta?.docs?.url : undefined;
            expect(url).toBe(
                `https://github.com/PavelLazarchuk/eslint-plugin-design-tokens/blob/main/docs/rules/${name}.md`
            );
        }
    });

    it('ships a legacy config and a flat config', () => {
        expect(plugin.configs?.recommended).toMatchObject({ plugins: ['design-tokens'] });
        expect(Array.isArray(plugin.configs?.['flat/recommended'])).toBe(true);
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
