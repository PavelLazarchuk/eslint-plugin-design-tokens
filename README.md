# eslint-plugin-design-tokens

[![npm version](https://img.shields.io/npm/v/eslint-plugin-design-tokens.svg)](https://www.npmjs.com/package/eslint-plugin-design-tokens)
[![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-design-tokens.svg)](https://www.npmjs.com/package/eslint-plugin-design-tokens)

A design system only holds if nobody reaches past it. This plugin flags the two values that leak first — **colors** and **spacing** — wherever they get written inline: `sx`, `style`, and `styled` components.

```sh
npm install --save-dev eslint-plugin-design-tokens
```

```jsx
<Box sx={{ color: '#ff0000', padding: '8px' }} />
//               ~~~~~~~~~          ~~~~~
//   Hardcoded color value "#ff0000" — use a theme token instead.
//   Hardcoded spacing value "8px" for "padding" — use a theme token instead.
```

Interpolated values are left alone, because a value that comes from an expression is already coming from somewhere:

```js
styled.div`
    color: ${({ theme }) => theme.palette.primary.main}; /* fine */
    padding: 8px; /* reported */
`;
```

## Setup

### Flat config (ESLint 9+)

```js
// eslint.config.js
import designTokens from 'eslint-plugin-design-tokens';

export default [...designTokens.configs['flat/recommended']];
```

Or wire the rules up yourself:

```js
import designTokens from 'eslint-plugin-design-tokens';

export default [
    {
        files: ['src/**/*.{js,jsx,ts,tsx}'],
        plugins: { 'design-tokens': designTokens },
        rules: {
            'design-tokens/no-hardcoded-colors': 'error',
            'design-tokens/no-hardcoded-spacing': 'warn',
        },
    },
];
```

### Legacy config (`.eslintrc`)

```json
{
    "extends": ["plugin:design-tokens/recommended"]
}
```

The recommended config turns both rules on as `warn`.

## What gets checked

| Source                     | Example                                              |
| -------------------------- | ---------------------------------------------------- |
| `sx` and `style` JSX props | `<Box sx={{ color: '#fff' }} />`                     |
| `styled` template literals | ``styled.div`color: #fff;` ``                        |
| `styled` style objects     | `styled.div({ color: '#fff' })`                      |
| `styled` style functions   | `styled(Button)(({ theme }) => ({ color: '#fff' }))` |

Both `styled.<tag>` and `styled(Component)` forms are recognised, which covers styled-components and emotion alike. Nested selectors and media queries are walked too, so `'&:hover': { color: '#fff' }` is not a hiding place.

Nothing is reported unless the value is a plain string the linter can read in full: `theme.palette.primary.main`, a `${...}` interpolation, a numeric literal and anything containing `var(--...)` all pass untouched.

## Rules

### `no-hardcoded-colors`

Reports a string whose whole value is a color: hex (`#fff`, `#ff0000ff`), `rgb()`/`rgba()`, `hsl()`/`hsla()`, or a CSS named color (`red`, `rebeccapurple`).

| Option      | Type       | Default                                              |
| ----------- | ---------- | ---------------------------------------------------- |
| `allowlist` | `string[]` | `['transparent', 'inherit', 'currentColor', 'none']` |

`allowlist` **replaces** the default list rather than extending it, so include the defaults you still want:

```js
{
    'design-tokens/no-hardcoded-colors': [
        'error',
        { allowlist: ['transparent', 'inherit', 'currentColor', 'none', '#0000'] },
    ],
}
```

### `no-hardcoded-spacing`

Reports a string holding a single length in `px`, `rem` or `em` on a spacing property.

| Option       | Type       | Default                                                                                                                                                |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `properties` | `string[]` | `margin`, `margin-top/right/bottom/left`, `padding`, `padding-top/right/bottom/left`, `gap`, `row-gap`, `column-gap`, `top`, `right`, `bottom`, `left` |
| `allowlist`  | `string[]` | `[]`                                                                                                                                                   |

`width` and `height` are deliberately left out — fixed sizes are legitimate far more often than fixed margins are. Add them when your system says otherwise:

```js
{
    'design-tokens/no-hardcoded-spacing': [
        'warn',
        { properties: ['margin', 'padding', 'gap', 'width', 'height'], allowlist: ['1px'] },
    ],
}
```

Property names are matched in kebab-case, and camelCase keys are normalised before the check — `marginTop` and `'margin-top'` are the same property.

Unitless values are never reported, so `margin: '0'` and MUI's `sx={{ p: 2 }}` spacing multipliers pass.

## Scope

There is no autofix. Turning `'#ff0000'` into the right token needs a token map and a human decision about which token is right; a plugin guessing at that would be worse than the hardcode.

Values are matched whole. `border: '1px solid #fff'` is not reported, because the rule cannot tell which part of a shorthand your system owns.

Typography, radii and shadows are not covered yet.

## License

MIT © [Pavel Lazarchuk](https://github.com/PavelLazarchuk)
