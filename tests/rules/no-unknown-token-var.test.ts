import rule from '../../src/rules/no-unknown-token-var';
import { ruleTester } from '../ruleTester';

ruleTester.run('no-unknown-token-var', rule, {
    valid: [
        '<Box sx={{ color: "var(--brand-primary)" }} />',
        { code: '<Box sx={{ color: "var(--brand-primary)" }} />', options: [{}] },
        { code: '<Box sx={{ color: "var(--x)" }} />', options: [{ prefixes: [], allowlist: [] }] },
        {
            code: '<Box sx={{ color: "var(--ds-color-text)" }} />',
            options: [{ prefixes: ['ds-'] }],
        },
        {
            code: '<Box sx={{ color: "var(--ds-color-text)" }} />',
            options: [{ prefixes: ['--ds-'] }],
        },
        {
            code: '<Box sx={{ color: "var(--DS-Color-Text)" }} />',
            options: [{ prefixes: ['ds-'] }],
        },
        {
            code: 'styled.div`color: var(--ds-color-text);`',
            options: [{ prefixes: ['ds-'] }],
        },
        {
            code: '<Box sx={{ color: "var(--brand-primary)" }} />',
            options: [{ allowlist: ['--brand-primary'] }],
        },
        {
            code: '<Box sx={{ color: "var(--brand-primary)" }} />',
            options: [{ allowlist: ['brand-primary'] }],
        },
        {
            code: '<Box sx={{ color: "var(--ds-fg, var(--ds-fg-default))" }} />',
            options: [{ prefixes: ['ds-'] }],
        },
        { code: '<Box sx={{ color: "#fff" }} />', options: [{ prefixes: ['ds-'] }] },
        {
            code: '<Box sx={{ color: theme.palette.primary.main }} />',
            options: [{ prefixes: ['ds-'] }],
        },
        { code: 'styled.div`color: ${theme.color};`', options: [{ prefixes: ['ds-'] }] },
    ],
    invalid: [
        {
            code: '<Box sx={{ color: "var(--brand-primary)" }} />',
            options: [{ prefixes: ['ds-'] }],
            errors: [
                {
                    messageId: 'unknownTokenVar',
                    data: { variable: '--brand-primary', property: 'color' },
                },
            ],
        },
        {
            code: '<Box sx={{ color: "var(--brand-primary)" }} />',
            options: [{ allowlist: ['--ds-fg'] }],
            errors: [{ messageId: 'unknownTokenVar' }],
        },
        {
            code: '<Box sx={{ border: "var(--legacy-width) solid var(--legacy-color)" }} />',
            options: [{ prefixes: ['ds-'] }],
            errors: [
                {
                    messageId: 'unknownTokenVar',
                    data: { variable: '--legacy-width', property: 'border' },
                },
                {
                    messageId: 'unknownTokenVar',
                    data: { variable: '--legacy-color', property: 'border' },
                },
            ],
        },
        {
            code: '<Box sx={{ color: "var(--legacy-fg, var(--ds-fg))" }} />',
            options: [{ prefixes: ['ds-'] }],
            errors: [
                {
                    messageId: 'unknownTokenVar',
                    data: { variable: '--legacy-fg', property: 'color' },
                },
            ],
        },
        {
            code: 'styled.div`color: var(--legacy-fg);`',
            options: [{ prefixes: ['ds-'] }],
            errors: [{ messageId: 'unknownTokenVar', line: 1, column: 12 }],
        },
        {
            code: 'css({ color: "var(--legacy-fg)" })',
            options: [{ prefixes: ['ds-'] }],
            errors: [{ messageId: 'unknownTokenVar' }],
        },
    ],
});
