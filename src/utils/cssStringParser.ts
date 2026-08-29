import type { AstNode } from '../types';

interface TemplateElement extends AstNode {
    value: { raw: string; cooked?: string | null };
    range: [number, number];
}

interface TemplateLiteral extends AstNode {
    quasis: TemplateElement[];
}

export interface ParsedDeclaration {
    property: string;
    value: string;
    range: [number, number];
}

const PROPERTY_PATTERN = /^-{0,2}[a-zA-Z][a-zA-Z0-9-]*$/;

interface ParserState {
    buffer: string;
    start: number;
    end: number;
    interpolated: boolean;
    inComment: boolean;
}

function reset(state: ParserState): void {
    state.buffer = '';
    state.start = -1;
    state.end = -1;
    state.interpolated = false;
}

function flush(state: ParserState, out: ParsedDeclaration[]): void {
    const { buffer, start, end, interpolated } = state;
    reset(state);

    if (interpolated || start === -1) return;

    const separator = buffer.indexOf(':');
    if (separator === -1) return;

    const property = buffer.slice(0, separator).trim();
    const value = buffer.slice(separator + 1).trim();
    if (value === '' || !PROPERTY_PATTERN.test(property)) return;

    out.push({ property: property.toLowerCase(), value, range: [start, end] });
}

export function parseCssDeclarations(node: AstNode): ParsedDeclaration[] {
    const template = node as TemplateLiteral;
    const out: ParsedDeclaration[] = [];
    const state: ParserState = {
        buffer: '',
        start: -1,
        end: -1,
        interpolated: false,
        inComment: false,
    };

    for (let index = 0; index < template.quasis.length; index += 1) {
        const element = template.quasis[index];
        if (!element?.range) continue;

        const raw = element.value.raw;
        const base = element.range[0] + 1;

        for (let offset = 0; offset < raw.length; offset += 1) {
            const character = raw[offset] as string;
            const position = base + offset;

            if (state.inComment) {
                if (character === '/' && raw[offset - 1] === '*') state.inComment = false;
                continue;
            }
            if (character === '/' && raw[offset + 1] === '*') {
                state.inComment = true;
                continue;
            }

            if (character === ';' || character === '}') {
                flush(state, out);
                continue;
            }
            if (character === '{') {
                reset(state);
                continue;
            }

            if (character.trim() !== '') {
                if (state.start === -1) state.start = position;
                state.end = position + 1;
            }
            state.buffer += character;
        }

        if (index < template.quasis.length - 1) {
            if (state.buffer.trim() !== '') state.interpolated = true;
        } else {
            flush(state, out);
        }
    }

    return out;
}
