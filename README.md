# eslint-plugin-design-tokens

[![npm version](https://img.shields.io/npm/v/eslint-plugin-design-tokens.svg)](https://www.npmjs.com/package/eslint-plugin-design-tokens)
[![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-design-tokens.svg)](https://www.npmjs.com/package/eslint-plugin-design-tokens)

A design system only holds if nobody reaches past it. This plugin flags the values that leak first — **colors**, **spacing**, **typography**, **shadows**, **radii**, **borders**, **transitions** and **z-index** — wherever they get written inline: `sx`, `style`, `styles`, the emotion `css` prop, and `styled` components.

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
| `styles` JSX prop (antd)   | `<Card styles={{ body: { color: '#fff' } }} />`      |
| `css` JSX prop, object     | `<div css={{ color: '#fff' }} />`                    |
| `css` JSX prop, template   | ``<div css={css`color: #fff;`} />``                  |
| `css` tagged templates     | ``const style = css`color: #fff;` ``                 |
| `styled` template literals | ``styled.div`color: #fff;` ``                        |
| `styled` style objects     | `styled.div({ color: '#fff' })`                      |
| `styled` style functions   | `styled(Button)(({ theme }) => ({ color: '#fff' }))` |
| `styled` after `.attrs`    | ``styled.div.attrs({ type: 'text' })`color: #fff;``` |
| `css` and `style` objects  | `css({ color: '#fff' })`                             |
| global and keyframe blocks | ``createGlobalStyle`color: #fff;` ``                 |
| `sx` as a function         | `<Box sx={theme => ({ color: '#fff' })} />`          |
| `sx` as an array           | `<Box sx={[base, active && { color: '#fff' }]} />`   |

Both `styled.<tag>` and `styled(Component)` forms are recognised, which covers styled-components and emotion alike, and MUI's `sx` and Ant Design's `style` are read the same way:

```jsx
<Box sx={{ boxShadow: '0 1px 2px #000' }} />          {/* MUI */}
<Card style={{ borderRadius: '8px' }} />             {/* Ant Design */}
<div css={{ fontSize: '14px' }} />                   {/* emotion css prop */}
```

`css` is matched by name — `@emotion/react`, `@emotion/css` and `styled-components` all export it, and the import is not resolved. The same goes for `keyframes`, `createGlobalStyle` and `injectGlobal`, and for `style({ ... })`, which is how vanilla-extract writes a style object. `styled.div.attrs(...)` and `.withConfig(...)` are read as configuration, so the object handed to them is left alone and only the styles that follow are checked.

Every argument of a style call is read, so `styled.div(base, { color: '#fff' })` reports the second object as well as the first.

Nested selectors and media queries are walked too, so `'&:hover': { color: '#fff' }` is not a hiding place.

A style object pulled out into a `const` in the same file is followed one hop, so moving the hardcode up a line does not hide it:

```jsx
const styles = { padding: '8px' }; // reported here
<Box sx={styles} />;
```

Only `const` is followed, and only within the file — a `let`, an import or a call result is left alone. `as const` and `satisfies` are transparent, so `const styles = { padding: '8px' } as const` is read the same way.

Nothing is reported unless the value is a literal the linter can read in full — a string, a number, or a template literal with nothing interpolated into it: `theme.palette.primary.main` and a `${...}` interpolation pass untouched.

A value containing `var(--...)` also passes the value rules, because it already comes from a token. `no-unknown-token-var` is the one rule that looks inside it, and once you tell it your namespace it reports a variable your design system does not define:

```js
{
    'design-tokens/no-unknown-token-var': ['warn', { prefixes: ['--ds-'] }],
}
```

Numbers are read because that is how some values are written in a style object, and each rule decides what to do with them: `zIndex: 1300` is reported and `fontWeight: 700` is reported, while MUI's unitless multipliers `padding: 8` and `borderRadius: 2` are not, since a length without a unit is not a hardcoded length.

## Rules

<!-- begin auto-generated rules list -->

⚠️ [Configurations](https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#setup) set to warn in.\
✅ Set in the `recommended` [configuration](https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#setup).

| Name                                                               | Description                                                                    | ⚠️  |
| :----------------------------------------------------------------- | :----------------------------------------------------------------------------- | :-- |
| [no-hardcoded-borders](docs/rules/no-hardcoded-borders.md)         | Disallow hardcoded border values in style objects and styled-components        | ✅  |
| [no-hardcoded-colors](docs/rules/no-hardcoded-colors.md)           | Disallow hardcoded color values in style objects and styled-components         | ✅  |
| [no-hardcoded-radius](docs/rules/no-hardcoded-radius.md)           | Disallow hardcoded border-radius values in style objects and styled-components | ✅  |
| [no-hardcoded-shadows](docs/rules/no-hardcoded-shadows.md)         | Disallow hardcoded shadow values in style objects and styled-components        | ✅  |
| [no-hardcoded-spacing](docs/rules/no-hardcoded-spacing.md)         | Disallow hardcoded spacing values in style objects and styled-components       | ✅  |
| [no-hardcoded-transitions](docs/rules/no-hardcoded-transitions.md) | Disallow hardcoded transition values in style objects and styled-components    | ✅  |
| [no-hardcoded-typography](docs/rules/no-hardcoded-typography.md)   | Disallow hardcoded typography values in style objects and styled-components    | ✅  |
| [no-hardcoded-z-index](docs/rules/no-hardcoded-z-index.md)         | Disallow hardcoded z-index values in style objects and styled-components       | ✅  |
| [no-unknown-token-var](docs/rules/no-unknown-token-var.md)         | Disallow CSS custom properties outside the design system                       | ✅  |

<!-- end auto-generated rules list -->

## Scope

There is no autofix. Turning `'#ff0000'` into the right token needs a token map and a human decision about which token is right; a plugin guessing at that would be worse than the hardcode.

Values are matched whole, and a shorthand is only read when its shape is unambiguous — `border`, `box-shadow`, `border-radius` and `transition` are, so each reports once for the whole declaration. Anything else (`background: #fff url(...)`, `font: bold 14px/1.5 Inter`) is left alone, because the rule cannot tell which part of it your system owns.

## License

MIT © [Pavel Lazarchuk](https://github.com/PavelLazarchuk)
