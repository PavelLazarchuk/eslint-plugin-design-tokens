export interface Position {
    line: number;
    column: number;
}

export interface SourceLocation {
    start: Position;
    end: Position;
}

export interface AstNode {
    type: string;
    loc?: SourceLocation | null;
    [key: string]: unknown;
}

export interface StyleDeclaration {
    property: string;
    value: string;
    node: AstNode;
    loc: SourceLocation;
}
