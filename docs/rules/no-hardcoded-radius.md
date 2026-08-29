# design-tokens/no-hardcoded-radius

📝 Disallow hardcoded border-radius values in style objects and styled-components.

⚠️ This rule _warns_ in the ✅ `recommended` [config](https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#setup).

<!-- end auto-generated rule header -->

Reports a literal `border-radius` (and its per-corner and logical variants) in `px`, `rem`, `em` or `%`.

```jsx
/* ✗ incorrect */
<Card sx={{ borderRadius: '8px' }} />;
styled.div`
    border-top-left-radius: 4px;
`;

/* ✓ correct */
<Card sx={{ borderRadius: theme.shape.borderRadius }} />;
styled.div`
    border-top-left-radius: var(--radius-s);
`;
```

## Options

| Option       | Type       | Default                                                                                          |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------ |
| `properties` | `string[]` | `border-radius`, the four `border-*-*-radius` corners, and the four logical `border-*-*-radius`s |
| `allowlist`  | `string[]` | `[]`                                                                                             |

## Notes

Shorthands count as one hardcode: `border-radius: '4px 8px'` and `border-radius: '50% / 10%'` report once. A shorthand with one tokenized part — `'4px var(--radius-m)'` — is left alone.

MUI's `sx={{ borderRadius: 2 }}` multiplier is unitless and passes.
