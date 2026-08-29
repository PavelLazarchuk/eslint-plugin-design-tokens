import rule from '../../src/rules/no-hardcoded-radius';
import { ruleTester } from '../ruleTester';

ruleTester.run('no-hardcoded-radius', rule, {
    valid: [
        // Theme tokens are expressions, not literals.
        '<Box sx={{ borderRadius: theme.shape.borderRadius }} />',
        'styled.div`border-radius: ${theme.shape.borderRadius}px;`',
        'styled(Button)(({ theme }) => ({ borderRadius: theme.shape.borderRadius }))',

        // CSS variables and keywords.
        '<Box sx={{ borderRadius: "var(--radius-m)" }} />',
        '<Box sx={{ borderRadius: "inherit" }} />',
        // One tokenized part is enough to leave the shorthand alone.
        '<Box sx={{ borderRadius: "4px var(--radius-m)" }} />',

        // More parts than a radius shorthand can hold.
        '<Box sx={{ borderRadius: "1px 2px 3px 4px / 1px 2px 3px 4px 5px" }} />',

        // Not a radius property.
        '<Box sx={{ padding: "8px" }} />',
        'styled.div`border-width: 1px;`',

        {
            code: '<Box sx={{ borderRadius: "50%" }} />',
            options: [{ allowlist: ['50%'] }],
        },
        {
            code: '<Box sx={{ borderTopLeftRadius: "4px" }} />',
            options: [{ properties: ['border-radius'] }],
        },

        // Not an entry point.
        '<Box data-radius="4px" />',
        'notCss`border-radius: 4px;`',
    ],
    invalid: [
        // MUI sx.
        {
            code: '<Box sx={{ borderRadius: "4px" }} />',
            errors: [
                { messageId: 'hardcodedRadius', data: { value: '4px', property: 'border-radius' } },
            ],
        },
        // Ant Design inline style.
        {
            code: '<Card style={{ borderRadius: "8px" }} />',
            errors: [{ messageId: 'hardcodedRadius' }],
        },
        {
            code: '<Box sx={{ borderTopLeftRadius: "4px", borderBottomRightRadius: "0.5rem" }} />',
            errors: [{ messageId: 'hardcodedRadius' }, { messageId: 'hardcodedRadius' }],
        },
        // styled template.
        {
            code: 'styled.div`\n  border-radius: 4px;\n  border-top-left-radius: ${p};\n`',
            errors: [
                { messageId: 'hardcodedRadius', line: 2, column: 3, endLine: 2, endColumn: 21 },
            ],
        },
        // styled object.
        {
            code: 'styled(Button)({ borderRadius: "50%" })',
            errors: [{ messageId: 'hardcodedRadius' }],
        },
        // Emotion css prop, object and template forms.
        {
            code: '<div css={{ borderRadius: "4px" }} />',
            errors: [{ messageId: 'hardcodedRadius' }],
        },
        {
            code: '<div css={css`border-radius: 4px;`} />',
            errors: [{ messageId: 'hardcodedRadius' }],
        },
        {
            code: 'const style = css`border-radius: 2px;`',
            errors: [{ messageId: 'hardcodedRadius' }],
        },
        // Shorthands are one hardcode, not one per length.
        {
            code: '<Box sx={{ borderRadius: "4px 8px 4px 8px" }} />',
            errors: [
                {
                    messageId: 'hardcodedRadius',
                    data: { value: '4px 8px 4px 8px', property: 'border-radius' },
                },
            ],
        },
        {
            code: 'styled.div`border-radius: 50% / 10%;`',
            errors: [{ messageId: 'hardcodedRadius' }],
        },
        {
            code: 'styled.div(({ theme }) => ({ "&:hover": { borderRadius: "12px" } }))',
            errors: [{ messageId: 'hardcodedRadius' }],
        },
    ],
});
