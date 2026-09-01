import type { AstNode, Position, StyleDeclaration } from '../types';
import { parseCssDeclarations } from './cssStringParser';

interface Identifier extends AstNode {
    name: string;
}

interface Literal extends AstNode {
    value: unknown;
}

interface TemplateElement extends AstNode {
    value: { raw: string; cooked?: string | null };
}

interface TemplateLiteral extends AstNode {
    quasis: TemplateElement[];
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

interface ArrayExpression extends AstNode {
    elements: (AstNode | null)[];
}

interface LogicalExpression extends AstNode {
    left: AstNode;
    right: AstNode;
}

interface ConditionalExpression extends AstNode {
    consequent: AstNode;
    alternate: AstNode;
}

interface WrappedExpression extends AstNode {
    expression: AstNode;
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

const CSS_TAGS = new Set([CSS_FACTORY, 'keyframes', 'createGlobalStyle', 'injectGlobal']);

const CSS_OBJECT_FACTORIES = new Set([...CSS_TAGS, 'style']);

const STYLED_CONFIG_METHODS = new Set(['attrs', 'withConfig']);

const WRAPPER_EXPRESSIONS = new Set([
    'TSAsExpression',
    'TSSatisfiesExpression',
    'TSNonNullExpression',
    'TSTypeAssertion',
    'TSInstantiationExpression',
]);

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

function isCssTag(value: unknown): boolean {
    return isType<Identifier>(value, 'Identifier') && CSS_TAGS.has(value.name);
}

function isCssObjectFactory(value: unknown): boolean {
    return isType<Identifier>(value, 'Identifier') && CSS_OBJECT_FACTORIES.has(value.name);
}

function isStyledFactory(value: unknown): boolean {
    if (isType<MemberExpression>(value, 'MemberExpression')) {
        return (
            !value.computed &&
            isStyledIdentifier(value.object) &&
            isType<Identifier>(value.property, 'Identifier') &&
            !STYLED_CONFIG_METHODS.has(value.property.name)
        );
    }
    if (isType<CallExpression>(value, 'CallExpression')) {
        if (isStyledIdentifier(value.callee)) return true;

        const { callee } = value;
        return (
            isType<MemberExpression>(callee, 'MemberExpression') &&
            !callee.computed &&
            isType<Identifier>(callee.property, 'Identifier') &&
            STYLED_CONFIG_METHODS.has(callee.property.name) &&
            isStyledFactory(callee.object)
        );
    }
    return false;
}

function constantInit(variable: ScopeVariable): AstNode | null {
    if (variable.defs.length !== 1) return null;

    const definition = variable.defs[0] as VariableDefinition;
    if (definition.type !== 'Variable' || definition.parent?.kind !== 'const') return null;

    const { init } = definition.node as { init?: unknown };
    return isNode(init) ? init : null;
}

function constantValue(expression: Identifier, resolver?: ScopeProvider): AstNode | null {
    if (!resolver) return null;

    const { name } = expression;
    let scope: Scope | null = resolver.getScope(expression as never);

    while (scope !== null) {
        const variable = scope.variables.find(entry => entry.name === name);
        if (variable) return constantInit(variable);
        scope = scope.upper;
    }
    return null;
}

/**
 * Every style object an expression can stand for: the object itself, the members of an `sx`
 * array, the object a function returns, and — one hop, `const` only — the object a name is
 * bound to.
 */
function resolveObjects(
    expression: AstNode | null,
    resolver: ScopeProvider | undefined,
    seen: Set<AstNode>,
    out: ObjectExpression[]
): void {
    if (expression === null || seen.has(expression)) return;
    seen.add(expression);

    if (WRAPPER_EXPRESSIONS.has(expression.type)) {
        resolveObjects((expression as WrappedExpression).expression, resolver, seen, out);
        return;
    }
    if (isType<ObjectExpression>(expression, 'ObjectExpression')) {
        out.push(expression);
        return;
    }
    if (isType<ArrayExpression>(expression, 'ArrayExpression')) {
        for (const element of expression.elements) resolveObjects(element, resolver, seen, out);
        return;
    }
    if (isType<LogicalExpression>(expression, 'LogicalExpression')) {
        resolveObjects(expression.left, resolver, seen, out);
        resolveObjects(expression.right, resolver, seen, out);
        return;
    }
    if (isType<ConditionalExpression>(expression, 'ConditionalExpression')) {
        resolveObjects(expression.consequent, resolver, seen, out);
        resolveObjects(expression.alternate, resolver, seen, out);
        return;
    }
    if (expression.type === 'ArrowFunctionExpression' || expression.type === 'FunctionExpression') {
        const { body } = expression as FunctionLike;
        if (!isType<BlockStatement>(body, 'BlockStatement')) {
            resolveObjects(body, resolver, seen, out);
            return;
        }
        for (const statement of body.body) {
            if (isType<ReturnStatement>(statement, 'ReturnStatement'))
                resolveObjects(statement.argument, resolver, seen, out);
        }
        return;
    }
    if (isType<Identifier>(expression, 'Identifier'))
        resolveObjects(constantValue(expression, resolver), resolver, seen, out);
}

function styleObjects(expression: AstNode | null, resolver?: ScopeProvider): ObjectExpression[] {
    const out: ObjectExpression[] = [];
    resolveObjects(expression, resolver, new Set(), out);
    return out;
}

function styleCallObjects(node: AstNode, resolver?: ScopeProvider): ObjectExpression[] {
    if (!isType<CallExpression>(node, 'CallExpression')) return [];
    if (!isStyledFactory(node.callee) && !isCssObjectFactory(node.callee)) return [];

    return node.arguments.flatMap(argument => styleObjects(argument, resolver));
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

    if (isType<TaggedTemplateExpression>(expression, 'TaggedTemplateExpression'))
        return isCssTag(expression.tag) ? expression : null;
    return expression;
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
    return isType<TaggedTemplateExpression>(node, 'TaggedTemplateExpression') && isCssTag(node.tag);
}

export function isStyledObjectCall(node: AstNode): boolean {
    return styleCallObjects(node).length > 0;
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

function literalValue(node: AstNode): string | null {
    if (isType<Literal>(node, 'Literal')) {
        const { value } = node;
        return typeof value === 'string' || typeof value === 'number' ? String(value) : null;
    }
    if (isType<TemplateLiteral>(node, 'TemplateLiteral') && node.quasis.length === 1) {
        const quasi = node.quasis[0];
        if (!quasi) return null;
        return quasi.value.cooked ?? quasi.value.raw;
    }
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

        const value = literalValue(property.value);
        if (value === null) continue;

        out.push({
            property: normalizeProperty(name),
            value: value.trim(),
            node: property,
            loc: property.loc,
        });
    }
}

function collectFromObjects(objects: ObjectExpression[]): StyleDeclaration[] {
    const declarations: StyleDeclaration[] = [];
    for (const object of objects) collectFromObject(object, declarations);
    return declarations;
}

export function getPropDeclarations(node: AstNode, resolver?: ScopeProvider): StyleDeclaration[] {
    const expression = styledPropExpression(node) ?? cssPropExpression(node);
    return collectFromObjects(styleObjects(expression, resolver));
}

export function getStyledObjectDeclarations(
    node: AstNode,
    resolver?: ScopeProvider
): StyleDeclaration[] {
    return collectFromObjects(styleCallObjects(node, resolver));
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
