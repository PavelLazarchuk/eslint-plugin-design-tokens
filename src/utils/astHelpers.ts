import type { AstNode, Position, StyleDeclaration } from '../types';
import { parseCssDeclarations } from './cssStringParser';

interface Identifier extends AstNode {
    name: string;
}

interface Literal extends AstNode {
    value: unknown;
}

interface MemberExpression extends AstNode {
    object: AstNode;
    property: AstNode;
    computed: boolean;
}

interface CallExpression extends AstNode {
    callee: AstNode;
    arguments: AstNode[];
}

interface FunctionLike extends AstNode {
    body: AstNode;
}

interface BlockStatement extends AstNode {
    body: AstNode[];
}

interface ReturnStatement extends AstNode {
    argument: AstNode | null;
}

interface Property extends AstNode {
    key: AstNode;
    value: AstNode;
    computed: boolean;
}

interface ObjectExpression extends AstNode {
    properties: AstNode[];
}

interface JSXAttribute extends AstNode {
    name: AstNode;
    value: AstNode | null;
}

interface JSXExpressionContainer extends AstNode {
    expression: AstNode;
}

interface TaggedTemplateExpression extends AstNode {
    tag: AstNode;
    quasi: AstNode;
}

interface VariableDefinition {
    type: string;
    node: AstNode;
    parent?: AstNode | null;
}

interface ScopeVariable {
    name: string;
    defs: unknown[];
}

interface Scope {
    variables: ScopeVariable[];
    upper: Scope | null;
}

export interface ScopeProvider {
    getScope(node: never): Scope;
}

const TARGET_PROPS = new Set(['sx', 'style', 'styles']);
const STYLED_FACTORY = 'styled';
const CSS_FACTORY = 'css';

function isNode(value: unknown): value is AstNode {
    return (
        typeof value === 'object' && value !== null && typeof (value as AstNode).type === 'string'
    );
}

function isType<T extends AstNode>(value: unknown, type: string): value is T {
    return isNode(value) && value.type === type;
}

function isStyledIdentifier(value: unknown): boolean {
    return isType<Identifier>(value, 'Identifier') && value.name === STYLED_FACTORY;
}

function isCssFactory(value: unknown): boolean {
    return isType<Identifier>(value, 'Identifier') && value.name === CSS_FACTORY;
}

function isStyledFactory(value: unknown): boolean {
    if (isType<MemberExpression>(value, 'MemberExpression')) {
        return (
            !value.computed &&
            isStyledIdentifier(value.object) &&
            isType(value.property, 'Identifier')
        );
    }
    if (isType<CallExpression>(value, 'CallExpression')) {
        return isStyledIdentifier(value.callee);
    }
    return false;
}

function constantObject(variable: ScopeVariable): ObjectExpression | null {
    if (variable.defs.length !== 1) return null;

    const definition = variable.defs[0] as VariableDefinition;
    if (definition.type !== 'Variable' || definition.parent?.kind !== 'const') return null;

    const { init } = definition.node as { init?: unknown };
    return isType<ObjectExpression>(init, 'ObjectExpression') ? init : null;
}

function resolveObject(
    expression: AstNode | null,
    resolver?: ScopeProvider
): ObjectExpression | null {
    if (expression === null) return null;
    if (isType<ObjectExpression>(expression, 'ObjectExpression')) return expression;
    if (!resolver || !isType<Identifier>(expression, 'Identifier')) return null;

    const { name } = expression;
    let scope: Scope | null = resolver.getScope(expression as never);

    while (scope !== null) {
        const variable = scope.variables.find(entry => entry.name === name);
        if (variable) return constantObject(variable);
        scope = scope.upper;
    }
    return null;
}

function styledObjectArgument(node: AstNode, resolver?: ScopeProvider): ObjectExpression | null {
    if (!isType<CallExpression>(node, 'CallExpression')) return null;
    if (!isStyledFactory(node.callee) || node.arguments.length !== 1) return null;

    const argument = node.arguments[0];
    if (!argument) return null;
    if (argument.type !== 'ArrowFunctionExpression' && argument.type !== 'FunctionExpression')
        return resolveObject(argument, resolver);

    const body = (argument as FunctionLike).body;
    if (!isType<BlockStatement>(body, 'BlockStatement')) return resolveObject(body, resolver);

    for (const statement of body.body) {
        if (!isType<ReturnStatement>(statement, 'ReturnStatement')) continue;
        const returned = resolveObject(statement.argument, resolver);
        if (returned) return returned;
    }
    return null;
}

export function isTargetProp(node: AstNode): boolean {
    return styledPropExpression(node) !== null || isCssPropAttribute(node);
}

function jsxAttributeExpression(
    node: AstNode,
    name: (attribute: string) => boolean
): AstNode | null {
    if (!isType<JSXAttribute>(node, 'JSXAttribute')) return null;
    if (!isType<Identifier>(node.name, 'JSXIdentifier') || !name(node.name.name)) return null;
    if (!isType<JSXExpressionContainer>(node.value, 'JSXExpressionContainer')) return null;
    return node.value.expression;
}

function styledPropExpression(node: AstNode): AstNode | null {
    return jsxAttributeExpression(node, name => TARGET_PROPS.has(name));
}

function cssPropExpression(node: AstNode): AstNode | null {
    const expression = jsxAttributeExpression(node, name => name === CSS_FACTORY);
    if (expression === null) return null;

    if (isType<ObjectExpression>(expression, 'ObjectExpression')) return expression;
    if (isType<Identifier>(expression, 'Identifier')) return expression;
    if (
        isType<TaggedTemplateExpression>(expression, 'TaggedTemplateExpression') &&
        isCssFactory(expression.tag)
    )
        return expression;
    return null;
}

export function isCssPropAttribute(node: AstNode): boolean {
    return cssPropExpression(node) !== null;
}

export function isStyledTaggedTemplate(node: AstNode): boolean {
    return (
        isType<TaggedTemplateExpression>(node, 'TaggedTemplateExpression') &&
        isStyledFactory(node.tag)
    );
}

export function isCssTaggedTemplate(node: AstNode): boolean {
    return (
        isType<TaggedTemplateExpression>(node, 'TaggedTemplateExpression') && isCssFactory(node.tag)
    );
}

export function isStyledObjectCall(node: AstNode): boolean {
    return styledObjectArgument(node) !== null;
}

function normalizeProperty(name: string): string {
    return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function propertyName(key: AstNode, computed: boolean): string | null {
    if (computed) return null;
    if (isType<Identifier>(key, 'Identifier')) return key.name;
    if (isType<Literal>(key, 'Literal') && typeof key.value === 'string') return key.value;
    return null;
}

function collectFromObject(object: ObjectExpression, out: StyleDeclaration[]): void {
    for (const property of object.properties) {
        if (!isType<Property>(property, 'Property')) continue;

        // Nested selectors and media queries: '&:hover': { color: '#fff' }
        if (isType<ObjectExpression>(property.value, 'ObjectExpression')) {
            collectFromObject(property.value, out);
            continue;
        }

        const name = propertyName(property.key, property.computed);
        if (name === null || !property.loc) continue;
        if (!isType<Literal>(property.value, 'Literal')) continue;

        const literal = property.value.value;
        if (typeof literal !== 'string' && typeof literal !== 'number') continue;

        out.push({
            property: normalizeProperty(name),
            value: String(literal).trim(),
            node: property,
            loc: property.loc,
        });
    }
}

export function getPropDeclarations(node: AstNode, resolver?: ScopeProvider): StyleDeclaration[] {
    const object = resolveObject(styledPropExpression(node) ?? cssPropExpression(node), resolver);
    if (object === null) return [];

    const declarations: StyleDeclaration[] = [];
    collectFromObject(object, declarations);
    return declarations;
}

export function getStyledObjectDeclarations(
    node: AstNode,
    resolver?: ScopeProvider
): StyleDeclaration[] {
    const object = styledObjectArgument(node, resolver);
    if (object === null) return [];

    const declarations: StyleDeclaration[] = [];
    collectFromObject(object, declarations);
    return declarations;
}

export interface LocResolver {
    getLocFromIndex(index: number): Position;
}

export function getStyledTemplateDeclarations(
    node: AstNode,
    resolver: LocResolver
): StyleDeclaration[] {
    if (!isStyledTaggedTemplate(node) && !isCssTaggedTemplate(node)) return [];

    const template = (node as TaggedTemplateExpression).quasi;
    return parseCssDeclarations(template).map(({ property, value, range }) => ({
        property,
        value,
        node,
        loc: {
            start: resolver.getLocFromIndex(range[0]),
            end: resolver.getLocFromIndex(range[1]),
        },
    }));
}
