import rule from '../../src/rules/no-hardcoded-z-index';
import { ruleTester } from '../ruleTester';

ruleTester.run('no-hardcoded-z-index', rule, {
    valid: [
        '<Box sx={{ zIndex: theme.zIndex.modal }} />',
        'styled.div`z-index: ${theme.zIndex.appBar};`',
        'styled(Modal)(({ theme }) => ({ zIndex: theme.zIndex.drawer }))',

        '<Box sx={{ zIndex: "var(--layer-modal)" }} />',
        '<Box sx={{ zIndex: "auto" }} />',

        '<Box sx={{ zIndex: 0 }} />',
        '<Box sx={{ zIndex: 1 }} />',
        '<Box sx={{ zIndex: -1 }} />',
        'styled.div`z-index: 1;`',

        '<Box sx={{ padding: "8px" }} />',

        {
            code: '<Box sx={{ zIndex: 1300 }} />',
            options: [{ allowlist: [1300] }],
        },
        {
            code: '<Box sx={{ zIndex: 1300 }} />',
            options: [{ allowlist: ['1300'] }],
        },

        '<Box data-z-index="1300" />',
        'notCss`z-index: 1300;`',
    ],
    invalid: [
        {
            code: '<Box sx={{ zIndex: 1300 }} />',
            errors: [
                { messageId: 'hardcodedZIndex', data: { value: '1300', property: 'z-index' } },
            ],
        },
        {
            code: '<Modal style={{ zIndex: "1000" }} />',
            errors: [{ messageId: 'hardcodedZIndex' }],
        },
        {
            code: 'styled.div`\n  z-index: 1300;\n  top: ${p};\n`',
            errors: [
                { messageId: 'hardcodedZIndex', line: 2, column: 3, endLine: 2, endColumn: 16 },
            ],
        },
        {
            code: 'styled(Modal)({ zIndex: 1500 })',
            errors: [{ messageId: 'hardcodedZIndex' }],
        },
        {
            code: '<div css={{ zIndex: 10 }} />',
            errors: [{ messageId: 'hardcodedZIndex' }],
        },
        {
            code: '<div css={css`z-index: 10;`} />',
            errors: [{ messageId: 'hardcodedZIndex' }],
        },
        {
            code: 'const style = css`z-index: -5;`',
            errors: [{ messageId: 'hardcodedZIndex', data: { value: '-5', property: 'z-index' } }],
        },
        {
            code: 'styled.div(({ theme }) => ({ "&:hover": { zIndex: 2 } }))',
            errors: [{ messageId: 'hardcodedZIndex' }],
        },
        {
            code: '<Box sx={{ zIndex: 1 }} />',
            options: [{ allowlist: [] }],
            errors: [{ messageId: 'hardcodedZIndex' }],
        },
    ],
});
