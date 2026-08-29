import { describe, expect, it } from 'vitest';
import { Linter } from 'eslint';
import plugin from '../src/index';

describe('plugin', () => {
    it('exposes both rules', () => {
        expect(Object.keys(plugin.rules ?? {})).toEqual([
            'no-hardcoded-colors',
            'no-hardcoded-spacing',
        ]);
    });

    it('ships a legacy config and a flat config', () => {
        expect(plugin.configs?.recommended).toMatchObject({ plugins: ['design-tokens'] });
        expect(Array.isArray(plugin.configs?.['flat/recommended'])).toBe(true);
    });

    it('reports through the flat recommended config', () => {
        const messages = new Linter().verify(
            'styled.div`color: #fff; padding: 8px;`',
            [
                ...(plugin.configs!['flat/recommended'] as Linter.Config[]),
                { languageOptions: { ecmaVersion: 2022, sourceType: 'module' } },
            ],
            'example.js'
        );

        expect(messages.map(message => message.ruleId)).toEqual([
            'design-tokens/no-hardcoded-colors',
            'design-tokens/no-hardcoded-spacing',
        ]);
        expect(messages.every(message => message.severity === 1)).toBe(true);
    });
});
