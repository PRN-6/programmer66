// AST definitions for programmer66 Python-like Automation Language

export type ASTNode =
  | Program
  | FunctionDef
  | ReturnStmt
  | IfStmt
  | WhileStmt
  | ForStmt
  | BreakStmt
  | ContinueStmt
  | PassStmt
  | AssignStmt
  | ExpressionStmt
  | BinaryExpr
  | UnaryExpr
  | CallExpr
  | MemberExpr
  | IndexExpr
  | SliceExpr
  | Identifier
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | NoneLiteral
  | ListLiteral
  | DictLiteral;

export interface SourceLocation {
  line: number;
  column: number;
}

export interface BaseNode {
  type: string;
  loc?: SourceLocation;
}

export interface Program extends BaseNode {
  type: 'Program';
  body: ASTNode[];
}

export interface FunctionDef extends BaseNode {
  type: 'FunctionDef';
  name: string;
  params: string[];
  body: ASTNode[];
}

export interface ReturnStmt extends BaseNode {
  type: 'ReturnStmt';
  value: ASTNode | null;
}

export interface IfStmt extends BaseNode {
  type: 'IfStmt';
  test: ASTNode;
  consequent: ASTNode[];
  elifBranches: { test: ASTNode; body: ASTNode[] }[];
  alternate: ASTNode[] | null;
}

export interface WhileStmt extends BaseNode {
  type: 'WhileStmt';
  test: ASTNode;
  body: ASTNode[];
}

export interface ForStmt extends BaseNode {
  type: 'ForStmt';
  variable: string;
  iterable: ASTNode;
  body: ASTNode[];
}

export interface BreakStmt extends BaseNode {
  type: 'BreakStmt';
}

export interface ContinueStmt extends BaseNode {
  type: 'ContinueStmt';
}

export interface PassStmt extends BaseNode {
  type: 'PassStmt';
}

export interface AssignStmt extends BaseNode {
  type: 'AssignStmt';
  target: Identifier | MemberExpr | IndexExpr;
  value: ASTNode;
}

export interface ExpressionStmt extends BaseNode {
  type: 'ExpressionStmt';
  expression: ASTNode;
}

export interface BinaryExpr extends BaseNode {
  type: 'BinaryExpr';
  operator:
    | '+'
    | '-'
    | '*'
    | '/'
    | '%'
    | '=='
    | '!='
    | '<'
    | '<='
    | '>'
    | '>='
    | 'in'
    | 'and'
    | 'or';
  left: ASTNode;
  right: ASTNode;
}

export interface UnaryExpr extends BaseNode {
  type: 'UnaryExpr';
  operator: '-' | 'not';
  argument: ASTNode;
}

export interface CallExpr extends BaseNode {
  type: 'CallExpr';
  callee: ASTNode;
  args: ASTNode[];
}

export interface MemberExpr extends BaseNode {
  type: 'MemberExpr';
  object: ASTNode;
  property: string;
}

export interface IndexExpr extends BaseNode {
  type: 'IndexExpr';
  object: ASTNode;
  index: ASTNode;
}

export interface Identifier extends BaseNode {
  type: 'Identifier';
  name: string;
}

export interface NumberLiteral extends BaseNode {
  type: 'NumberLiteral';
  value: number;
}

export interface StringLiteral extends BaseNode {
  type: 'StringLiteral';
  value: string;
}

export interface BooleanLiteral extends BaseNode {
  type: 'BooleanLiteral';
  value: boolean;
}

export interface NoneLiteral extends BaseNode {
  type: 'NoneLiteral';
}

export interface ListLiteral extends BaseNode {
  type: 'ListLiteral';
  elements: ASTNode[];
}

export interface SliceExpr extends BaseNode {
  type: 'SliceExpr';
  object: ASTNode;
  start?: ASTNode | null;
  stop?: ASTNode | null;
  step?: ASTNode | null;
}

export interface DictEntry {
  key: ASTNode;
  value: ASTNode;
}

export interface DictLiteral extends BaseNode {
  type: 'DictLiteral';
  entries: DictEntry[];
}

