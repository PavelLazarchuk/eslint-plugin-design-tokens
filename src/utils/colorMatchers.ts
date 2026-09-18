import { splitTopLevel, tokenizeValue } from './valueTokens';

const HEX = /^#[0-9a-fA-F]{3,8}$/;
const FUNCTIONAL = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix|color|light-dark)\(/i;
const CALL = /^(-?[a-z][a-z0-9-]*)\((.*)\)$/is;

const NAMED_COLORS = new Set([
    'aliceblue',
    'antiquewhite',
    'aqua',
    'aquamarine',
    'azure',
    'beige',
    'bisque',
    'black',
    'blanchedalmond',
    'blue',
    'blueviolet',
    'brown',
    'burlywood',
    'cadetblue',
    'chartreuse',
    'chocolate',
    'coral',
    'cornflowerblue',
    'cornsilk',
    'crimson',
    'cyan',
    'darkblue',
    'darkcyan',
    'darkgoldenrod',
    'darkgray',
    'darkgreen',
    'darkgrey',
    'darkkhaki',
    'darkmagenta',
    'darkolivegreen',
    'darkorange',
    'darkorchid',
    'darkred',
    'darksalmon',
    'darkseagreen',
    'darkslateblue',
    'darkslategray',
    'darkslategrey',
    'darkturquoise',
    'darkviolet',
    'deeppink',
    'deepskyblue',
    'dimgray',
    'dimgrey',
    'dodgerblue',
    'firebrick',
    'floralwhite',
    'forestgreen',
    'fuchsia',
    'gainsboro',
    'ghostwhite',
    'gold',
    'goldenrod',
    'gray',
    'green',
    'greenyellow',
    'grey',
    'honeydew',
    'hotpink',
    'indianred',
    'indigo',
    'ivory',
    'khaki',
    'lavender',
    'lavenderblush',
    'lawngreen',
    'lemonchiffon',
    'lightblue',
    'lightcoral',
    'lightcyan',
    'lightgoldenrodyellow',
    'lightgray',
    'lightgreen',
    'lightgrey',
    'lightpink',
    'lightsalmon',
    'lightseagreen',
    'lightskyblue',
    'lightslategray',
    'lightslategrey',
    'lightsteelblue',
    'lightyellow',
    'lime',
    'limegreen',
    'linen',
    'magenta',
    'maroon',
    'mediumaquamarine',
    'mediumblue',
    'mediumorchid',
    'mediumpurple',
    'mediumseagreen',
    'mediumslateblue',
    'mediumspringgreen',
    'mediumturquoise',
    'mediumvioletred',
    'midnightblue',
    'mintcream',
    'mistyrose',
    'moccasin',
    'navajowhite',
    'navy',
    'oldlace',
    'olive',
    'olivedrab',
    'orange',
    'orangered',
    'orchid',
    'palegoldenrod',
    'palegreen',
    'paleturquoise',
    'palevioletred',
    'papayawhip',
    'peachpuff',
    'peru',
    'pink',
    'plum',
    'powderblue',
    'purple',
    'rebeccapurple',
    'red',
    'rosybrown',
    'royalblue',
    'saddlebrown',
    'salmon',
    'sandybrown',
    'seagreen',
    'seashell',
    'sienna',
    'silver',
    'skyblue',
    'slateblue',
    'slategray',
    'slategrey',
    'snow',
    'springgreen',
    'steelblue',
    'tan',
    'teal',
    'thistle',
    'tomato',
    'turquoise',
    'violet',
    'wheat',
    'white',
    'whitesmoke',
    'yellow',
    'yellowgreen',
    'currentcolor',
    'transparent',
]);

export const DEFAULT_COLOR_ALLOWLIST = ['transparent', 'inherit', 'currentColor', 'none'];

const NAMELESS_PROPERTIES =
    /^(font|font-family|grid|grid-area|grid-template|grid-template-areas|grid-template-columns|grid-template-rows|animation|animation-name|content|counter-reset|counter-increment|src|will-change|transition-property)$/;

export function isColorValue(value: string): boolean {
    const normalized = value.trim();

    if (normalized.includes('var(')) return false;

    return (
        HEX.test(normalized) ||
        FUNCTIONAL.test(normalized) ||
        NAMED_COLORS.has(normalized.toLowerCase())
    );
}

export function isColorProperty(property: string): boolean {
    return !NAMELESS_PROPERTIES.test(property.trim().toLowerCase());
}

function isHardcodedColor(token: string, names: boolean): boolean {
    if (token.includes('var(')) return false;
    if (HEX.test(token) || FUNCTIONAL.test(token)) return true;

    return names && NAMED_COLORS.has(token.toLowerCase());
}

export function findColor(
    value: string,
    isAllowed: (token: string) => boolean,
    names = true
): string | null {
    for (const token of tokenizeValue(value)) {
        if (isAllowed(token)) continue;
        if (isHardcodedColor(token, names)) return token;

        const call = CALL.exec(token);

        if (!call) continue;

        const name = (call[1] as string).toLowerCase();

        if (name === 'url') continue;

        const args = splitTopLevel(call[2] as string, ',');
        const scanned = name === 'var' ? args.slice(1) : args;

        for (const argument of scanned) {
            const found = findColor(argument, isAllowed, names);

            if (found !== null) return found;
        }
    }

    return null;
}
