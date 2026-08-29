import rule from '../../src/rules/no-hardcoded-shadows';
import { ruleTester } from '../ruleTester';

ruleTester.run('no-hardcoded-shadows', rule, {
    valid: [
        // Theme tokens are expressions, not literals.
        '<Card sx={{ boxShadow: theme.shadows[2] }} />',
        'styled.div`box-shadow: ${theme.shadows[1]};`',
        'styled(Card)(({ theme }) => ({ boxShadow: theme.shadows[4] }))',

        // CSS variables and keywords.
        '<Card sx={{ boxShadow: "var(--shadow-m)" }} />',
        '<Card sx={{ boxShadow: "none" }} />',
        '<Card sx={{ boxShadow: "inherit" }} />',
        // One tokenized layer is enough to leave the declaration alone.
        '<Card sx={{ boxShadow: "0 1px 2px var(--shadow-color)" }} />',

        // A part the matcher cannot read leaves the whole layer alone.
        '<Card sx={{ boxShadow: "0 0 0 1px color-mix(in srgb, #000 20%, transparent)" }} />',

        // Not a shadow property.
        '<Box sx={{ padding: "8px" }} />',
        'styled.div`border: 1px solid #000;`',

        {
            code: '<Card sx={{ boxShadow: "0 1px 2px #000" }} />',
            options: [{ allowlist: ['0 1px 2px #000'] }],
        },
        {
            code: '<Card sx={{ textShadow: "0 1px 2px #000" }} />',
            options: [{ properties: ['box-shadow'] }],
        },

        // Not an entry point.
        '<Card data-shadow="0 1px 2px #000" />',
        'notCss`box-shadow: 0 1px 2px #000;`',
    ],
    invalid: [
        // MUI sx.
        {
            code: '<Card sx={{ boxShadow: "0 1px 2px #000" }} />',
            errors: [
                {
                    messageId: 'hardcodedShadow',
                    data: { value: '0 1px 2px #000', property: 'box-shadow' },
                },
            ],
        },
        // Ant Design inline style.
        {
            code: '<Card style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }} />',
            errors: [{ messageId: 'hardcodedShadow' }],
        },
        // A whole declaration is one hardcode: two comma-separated layers still report once.
        {
            code: '<Card sx={{ boxShadow: "0 1px 2px #000, 0 2px 4px #000" }} />',
            errors: [
                {
                    messageId: 'hardcodedShadow',
                    data: { value: '0 1px 2px #000, 0 2px 4px #000', property: 'box-shadow' },
                },
            ],
        },
        // The same in a template literal — still a single report.
        {
            code: 'styled.div`box-shadow: 0 1px 2px #000, 0 2px 4px #000;`',
            errors: [{ messageId: 'hardcodedShadow' }],
        },
        // Lengths alone, without a color, are a hardcode too.
        {
            code: 'styled.div`\n  box-shadow: inset 0 0 0 1px;\n  color: ${p};\n`',
            errors: [
                { messageId: 'hardcodedShadow', line: 2, column: 3, endLine: 2, endColumn: 30 },
            ],
        },
        // styled object.
        {
            code: 'styled(Card)({ boxShadow: "0 4px 12px rgba(0,0,0,.2)" })',
            errors: [{ messageId: 'hardcodedShadow' }],
        },
        // Emotion css prop, object and template forms.
        {
            code: '<div css={{ boxShadow: "0 1px 2px #000" }} />',
            errors: [{ messageId: 'hardcodedShadow' }],
        },
        {
            code: '<div css={css`box-shadow: 0 1px 2px #000;`} />',
            errors: [{ messageId: 'hardcodedShadow' }],
        },
        {
            code: 'const style = css`text-shadow: 0 1px 1px #000;`',
            errors: [
                {
                    messageId: 'hardcodedShadow',
                    data: { value: '0 1px 1px #000', property: 'text-shadow' },
                },
            ],
        },
        // inset and nested selectors.
        {
            code: 'styled.div(({ theme }) => ({ "&:hover": { boxShadow: "inset 0 0 0 1px red" } }))',
            errors: [{ messageId: 'hardcodedShadow' }],
        },
    ],
});
