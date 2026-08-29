import rule from '../../src/rules/no-hardcoded-transitions';
import { ruleTester } from '../ruleTester';

ruleTester.run('no-hardcoded-transitions', rule, {
    valid: [
        '<Box sx={{ transition: theme.transitions.create("all") }} />',
        'styled.div`transition: ${theme.transitions.create("opacity")};`',
        'styled(Button)(({ theme }) => ({ transition: theme.transitions.create("color") }))',

        '<Box sx={{ transition: "var(--transition-fast)" }} />',
        '<Box sx={{ transitionDuration: "var(--duration-fast)" }} />',
        '<Box sx={{ transition: "none" }} />',
        '<Box sx={{ transition: "inherit" }} />',
        '<Box sx={{ transitionProperty: "opacity" }} />',
        '<Box sx={{ transition: "color" }} />',

        '<Box sx={{ padding: "8px" }} />',
        'styled.div`animation-name: spin;`',

        {
            code: '<Box sx={{ transition: "all 0.3s ease" }} />',
            options: [{ allowlist: ['all 0.3s ease'] }],
        },
        {
            code: '<Box sx={{ animationDuration: "1s" }} />',
            options: [{ properties: ['transition'] }],
        },

        '<Box data-transition="all 0.3s ease" />',
        'notCss`transition: all 0.3s ease;`',
    ],
    invalid: [
        {
            code: '<Box sx={{ transition: "all 0.3s ease" }} />',
            errors: [
                {
                    messageId: 'hardcodedTransition',
                    data: { value: 'all 0.3s ease', property: 'transition' },
                },
            ],
        },
        {
            code: '<Card style={{ transition: "background-color 200ms" }} />',
            errors: [{ messageId: 'hardcodedTransition' }],
        },
        {
            code: '<Box sx={{ transitionDuration: "0.2s", transitionTimingFunction: "ease-in-out" }} />',
            errors: [{ messageId: 'hardcodedTransition' }, { messageId: 'hardcodedTransition' }],
        },
        {
            code: 'styled.div`\n  transition: all 0.3s ease;\n  animation: ${p};\n`',
            errors: [
                { messageId: 'hardcodedTransition', line: 2, column: 3, endLine: 2, endColumn: 28 },
            ],
        },
        {
            code: 'styled(Button)({ animation: "spin 1s linear infinite" })',
            errors: [{ messageId: 'hardcodedTransition' }],
        },
        {
            code: '<div css={{ transition: "opacity 150ms" }} />',
            errors: [{ messageId: 'hardcodedTransition' }],
        },
        {
            code: '<div css={css`transition: opacity 150ms;`} />',
            errors: [{ messageId: 'hardcodedTransition' }],
        },
        {
            code: 'const style = css`transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);`',
            errors: [
                {
                    messageId: 'hardcodedTransition',
                    data: {
                        value: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        property: 'transition-timing-function',
                    },
                },
            ],
        },
        {
            code: 'styled.div(({ theme }) => ({ "&:hover": { transition: "color 0.2s" } }))',
            errors: [{ messageId: 'hardcodedTransition' }],
        },
        {
            code: '<Box sx={{ transition: "color 0.2s ease, opacity 0.3s linear" }} />',
            errors: [
                {
                    messageId: 'hardcodedTransition',
                    data: {
                        value: 'color 0.2s ease, opacity 0.3s linear',
                        property: 'transition',
                    },
                },
            ],
        },
    ],
});
