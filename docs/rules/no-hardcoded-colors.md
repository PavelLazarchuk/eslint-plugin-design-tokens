# design-tokens/no-hardcoded-colors

📝 Disallow hardcoded color values in style objects and styled-components.

⚠️ This rule _warns_ in the ✅ `recommended` [config](https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#setup).

<!-- end auto-generated rule header -->

Reports a color written by hand **anywhere in a value**: hex (`#fff`, `#ff0000ff`), `rgb()`/`rgba()`, `hsl()`/`hsla()`, the modern spaces — `oklch()`, `oklab()`, `lab()`, `lch()`, `hwb()`, `color()`, `color-mix()`, `light-dark()` — or a CSS named color (`red`, `rebeccapurple`).

```jsx
/* ✗ incorrect */
<Box sx={{ color: '#ff0000' }} />;
<Box sx={{ background: 'linear-gradient(#fff, #000)' }} />;
<Box sx={{ color: 'oklch(0.7 0.1 250)' }} />;
styled.div`
    background: rgba(0, 0, 0, 0.5);
    border-top: 1px solid #ccc;
    filter: drop-shadow(0 0 2px #000);
`;

/* ✓ correct */
<Box sx={{ color: theme.palette.error.main }} />;
<Box sx={{ background: 'linear-gradient(var(--from), var(--to))' }} />;
styled.div`
    background: var(--color-overlay);
    border-top: 1px solid var(--ds-border);
`;
```

Only the color is named in the message, not the value it was hiding in, and a declaration is reported once however many colors it holds.

### Inside `var()`

A value that reads a custom property is left alone — that is the token doing its job. Its **fallback** is not:

```jsx
/* ✗ incorrect */ <Box sx={{ color: 'var(--brand, #fff)' }} />;
/* ✓ correct */ <Box sx={{ color: 'var(--brand, var(--brand-fallback))' }} />;
```

## Options

| Option                  | Type       | Default                                              |
| ----------------------- | ---------- | ---------------------------------------------------- |
| `allowlist`             | `string[]` | `['transparent', 'inherit', 'currentColor', 'none']` |
| `allowlistPatterns`     | `string[]` | `[]`                                                 |
| `ignorePropertyPattern` | `string`   | —                                                    |

`allowlistPatterns` and `ignorePropertyPattern` are read by every rule in this plugin: the first excuses a value that any of the patterns matches, the second skips a declaration whose property matches it. Both are regular expressions written as strings and compiled with the `u` flag, and a property is matched by its CSS spelling — `backgroundColor` in a style object is tested as `background-color`.

`allowlist` **replaces** the default list rather than extending it, so include the defaults you still want:

```js
{
    'design-tokens/no-hardcoded-colors': [
        'error',
        { allowlist: ['transparent', 'inherit', 'currentColor', 'none', '#0000'] },
    ],
}
```

## Notes

A named color is only recognised inside a longer value when the property could hold one. `fontFamily: 'Tan, sans-serif'` is a font stack, not a color, and the same goes for `font`, `grid-template-areas`, `animation-name`, `content`, `will-change`, `transition-property`, `src` and the counter properties. Hex and the color functions are unambiguous, so they are reported in those properties too.

A shorthand can be hardcoded twice over: `border: '1px solid #ccc'` has a width this rule does not read and a color [`no-hardcoded-borders`](./no-hardcoded-borders.md) does not read, so with both rules on you get one message from each — the length and the color are two different tokens to pick.
