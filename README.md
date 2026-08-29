# eslint-plugin-design-tokens

[![npm version](https://img.shields.io/npm/v/eslint-plugin-design-tokens.svg)](https://www.npmjs.com/package/eslint-plugin-design-tokens)
[![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-design-tokens.svg)](https://www.npmjs.com/package/eslint-plugin-design-tokens)

A design system only holds if nobody reaches past it. This plugin flags the values that leak first — **colors**, **spacing**, **typography**, **shadows** and **radii** — wherever they get written inline: `sx`, `style`, the emotion `css` prop, and `styled` components.

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

The recommended config turns every rule on as `warn`.

## What gets checked

| Source                     | Example                                              |
| -------------------------- | ---------------------------------------------------- |
| `sx` and `style` JSX props | `<Box sx={{ color: '#fff' }} />`                     |
| `css` JSX prop, object     | `<div css={{ color: '#fff' }} />`                    |
| `css` JSX prop, template   | ``<div css={css`color: #fff;`} />``                  |
| `css` tagged templates     | ``const style = css`color: #fff;` ``                 |
| `styled` template literals | ``styled.div`color: #fff;` ``                        |
| `styled` style objects     | `styled.div({ color: '#fff' })`                      |
| `styled` style functions   | `styled(Button)(({ theme }) => ({ color: '#fff' }))` |

Both `styled.<tag>` and `styled(Component)` forms are recognised, which covers styled-components and emotion alike, and MUI's `sx` and Ant Design's `style` are read the same way:

```jsx
<Box sx={{ boxShadow: '0 1px 2px #000' }} />          {/* MUI */}
<Card style={{ borderRadius: '8px' }} />             {/* Ant Design */}
<div css={{ fontSize: '14px' }} />                   {/* emotion css prop */}
```

`css` is matched by name — `@emotion/react`, `@emotion/css` and `styled-components` all export it, and the import is not resolved.

Nested selectors and media queries are walked too, so `'&:hover': { color: '#fff' }` is not a hiding place.

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

### `no-hardcoded-typography`

Reports a literal `font-size` (`px`, `rem`, `em`, `pt`, `%`), a numeric `font-weight`, or a `line-height` given as a length or a bare number.

| Option            | Type       | Default                                                  |
| ----------------- | ---------- | -------------------------------------------------------- |
| `properties`      | `string[]` | `font-size`, `font-weight`, `line-height`, `font-family` |
| `allowlist`       | `string[]` | `[]`                                                     |
| `checkFontFamily` | `boolean`  | `false`                                                  |

`font-family` is off by default. A font stack is a name rather than a shape, so there is no way to tell a deliberate `'Inter, sans-serif'` from a leak — turning it on catches more and misfires more:

```js
{
    'design-tokens/no-hardcoded-typography': ['warn', { checkFontFamily: true }],
}
```

With it on, only `var(--...)` and the CSS-wide keywords (`inherit`, `initial`, `unset`, `revert`) pass.

### `no-hardcoded-shadows`

Reports a `box-shadow` or `text-shadow` whose value reads as a literal shadow: two or more lengths, or one length next to a literal color. `inset` is ignored while matching.

| Option       | Type       | Default                     |
| ------------ | ---------- | --------------------------- |
| `properties` | `string[]` | `box-shadow`, `text-shadow` |
| `allowlist`  | `string[]` | `[]`                        |

The whole declaration is matched at once, so a multi-layer shadow is **one** report, not one per layer:

```jsx
<Card sx={{ boxShadow: '0 1px 2px #000, 0 2px 4px #000' }} />
//                      ^ a single "hardcoded shadow" report
```

A layer holding anything the matcher cannot read — `var(--shadow-color)`, `color-mix(...)`, an unfamiliar unit — is left alone, on the assumption that a value it cannot parse in full is a value it has no business rewriting.

### `no-hardcoded-radius`

Reports a literal `border-radius` (and its per-corner and logical variants) in `px`, `rem`, `em` or `%`.

| Option       | Type       | Default                                                                                         |
| ------------ | ---------- | ----------------------------------------------------------------------------------------------- |
| `properties` | `string[]` | `border-radius`, the four `border-*-*-radius` corners, and the four logical `border-*-*-radius` |
| `allowlist`  | `string[]` | `[]`                                                                                            |

Shorthands count as one hardcode: `border-radius: '4px 8px'` and `border-radius: '50% / 10%'` report once. A shorthand with one tokenized part — `'4px var(--radius-m)'` — is left alone.

## Scope

There is no autofix. Turning `'#ff0000'` into the right token needs a token map and a human decision about which token is right; a plugin guessing at that would be worse than the hardcode.

Values are matched whole. `border: '1px solid #fff'` is not reported, because the rule cannot tell which part of a shorthand your system owns. `box-shadow` and `border-radius` are the exceptions — their shorthands have a shape the matchers can read end to end, and each reports once for the whole declaration.

## License

MIT © [Pavel Lazarchuk](https://github.com/PavelLazarchuk)
