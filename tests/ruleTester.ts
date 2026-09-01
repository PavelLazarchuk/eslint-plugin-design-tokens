import { RuleTester } from 'eslint';
import type { Linter } from 'eslint';
import { describe, it } from 'vitest';
import { parser } from 'typescript-eslint';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

export const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: { ecmaFeatures: { jsx: true } },
    },
});

export const tsRuleTester = new RuleTester({
    languageOptions: {
        parser: parser as Linter.Parser,
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: { ecmaFeatures: { jsx: true } },
    },
});
