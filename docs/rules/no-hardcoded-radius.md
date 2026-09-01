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

| Option                  | Type       | Default                                                                                          |
| ----------------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| `properties`            | `string[]` | `border-radius`, the four `border-*-*-radius` corners, and the four logical `border-*-*-radius`s |
| `allowlist`             | `string[]` | `[]`                                                                                             |
| `allowlistPatterns`     | `string[]` | `[]`                                                                                             |
| `ignorePropertyPattern` | `string`   | —                                                                                                |

`allowlistPatterns` and `ignorePropertyPattern` are read by every rule in this plugin: the first excuses a value that any of the patterns matches, the second skips a declaration whose property matches it. Both are regular expressions written as strings and compiled with the `u` flag, and a property is matched by its CSS spelling — `backgroundColor` in a style object is tested as `background-color`.

## Notes

Shorthands count as one hardcode: `border-radius: '4px 8px'` and `border-radius: '50% / 10%'` report once. A shorthand with one tokenized part — `'4px var(--radius-m)'` — is left alone.

MUI's `sx={{ borderRadius: 2 }}` multiplier is unitless and passes.
