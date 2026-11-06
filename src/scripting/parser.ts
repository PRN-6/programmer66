import {
  ASTNode,
  Program,
  FunctionDef,
  ReturnStmt,
  IfStmt,
  WhileStmt,
  ForStmt,
  BreakStmt,
  ContinueStmt,
  PassStmt,
  AssignStmt,
  ExpressionStmt,
  BinaryExpr,
  UnaryExpr,
  CallExpr,
  MemberExpr,
  IndexExpr,
  Identifier,
  NumberLiteral,
  StringLiteral,
  BooleanLiteral,
  NoneLiteral,
  ListLiteral,
  SliceExpr,
  DictLiteral,
  DictEntry,
} from './ast';
import { Token, TokenType } from './lexer';

export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(): Program {
    const body: ASTNode[] = [];
    this.skipNewlines();

    while (!this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) {
        body.push(stmt);
      }
      this.skipNewlines();
    }

    return {
      type: 'Program',
      body,
    };
  }

  private parseStatement(): ASTNode {
    const token = this.peek();

    if (token.type === 'KEYWORD') {
      switch (token.value) {
        case 'def':
          return this.parseFunctionDef();
        case 'return':
          return this.parseReturn();
        case 'if':
          return this.parseIf();
        case 'while':
          return this.parseWhile();
        case 'for':
          return this.parseFor();
        case 'break':
          this.advance();
          this.expectNewlineOrSemicolon();
          return { type: 'BreakStmt', loc: { line: token.line, column: token.column } } as BreakStmt;
        case 'continue':
          this.advance();
          this.expectNewlineOrSemicolon();
          return { type: 'ContinueStmt', loc: { line: token.line, column: token.column } } as ContinueStmt;
        case 'pass':
          this.advance();
          this.expectNewlineOrSemicolon();
          return { type: 'PassStmt', loc: { line: token.line, column: token.column } } as PassStmt;
      }
    }

    // Could be assignment or expression statement
    const expr = this.parseExpression();

    if (this.match('ASSIGN')) {
      if (expr.type !== 'Identifier' && expr.type !== 'MemberExpr' && expr.type !== 'IndexExpr') {
        throw new Error(`Invalid assignment target at line ${expr.loc?.line || this.peek().line}`);
      }
      const value = this.parseExpression();
      this.expectNewlineOrSemicolon();
      return {
        type: 'AssignStmt',
        target: expr as Identifier | MemberExpr | IndexExpr,
        value,
        loc: expr.loc,
      } as AssignStmt;
    }

    this.expectNewlineOrSemicolon();
    return {
      type: 'ExpressionStmt',
      expression: expr,
      loc: expr.loc,
    } as ExpressionStmt;
  }

  private parseFunctionDef(): FunctionDef {
    const defToken = this.consume('KEYWORD', 'Expected "def"');
    const nameToken = this.consume('IDENTIFIER', 'Expected function name');
    this.consume('LPAREN', 'Expected "(" after function name');

    const params: string[] = [];
    if (!this.check('RPAREN')) {
      do {
        const param = this.consume('IDENTIFIER', 'Expected parameter name');
        params.push(param.value);
      } while (this.match('COMMA'));
    }
    this.consume('RPAREN', 'Expected ")" after parameter list');
    this.consume('COLON', 'Expected ":" after function signature');

    const body = this.parseBlock();

    return {
      type: 'FunctionDef',
      name: nameToken.value,
      params,
      body,
      loc: { line: defToken.line, column: defToken.column },
    };
  }

  private parseReturn(): ReturnStmt {
    const token = this.consume('KEYWORD', 'Expected "return"');
    let value: ASTNode | null = null;

    if (!this.check('NEWLINE') && !this.check('EOF')) {
      value = this.parseExpression();
    }
    this.expectNewlineOrSemicolon();

    return {
      type: 'ReturnStmt',
      value,
      loc: { line: token.line, column: token.column },
    };
  }

  private parseIf(): IfStmt {
    const ifToken = this.consume('KEYWORD', 'Expected "if"');
    const test = this.parseExpression();
    this.consume('COLON', 'Expected ":" after if condition');
    const consequent = this.parseBlock();

    const elifBranches: { test: ASTNode; body: ASTNode[] }[] = [];
    while (this.checkKeyword('elif')) {
      this.advance();
      const elifTest = this.parseExpression();
      this.consume('COLON', 'Expected ":" after elif condition');
      const elifBody = this.parseBlock();
      elifBranches.push({ test: elifTest, body: elifBody });
    }

    let alternate: ASTNode[] | null = null;
    if (this.checkKeyword('else')) {
      this.advance();
      this.consume('COLON', 'Expected ":" after else');
      alternate = this.parseBlock();
    }

    return {
      type: 'IfStmt',
      test,
      consequent,
      elifBranches,
      alternate,
      loc: { line: ifToken.line, column: ifToken.column },
    };
  }

  private parseWhile(): WhileStmt {
    const token = this.consume('KEYWORD', 'Expected "while"');
    const test = this.parseExpression();
    this.consume('COLON', 'Expected ":" after while condition');
    const body = this.parseBlock();

    return {
      type: 'WhileStmt',
      test,
      body,
      loc: { line: token.line, column: token.column },
    };
  }

  private parseFor(): ForStmt {
    const token = this.consume('KEYWORD', 'Expected "for"');
    const variable = this.consume('IDENTIFIER', 'Expected loop variable name').value;
    const inToken = this.consume('KEYWORD', 'Expected "in" after variable in for loop');
    if (inToken.value !== 'in') {
      throw new Error(`Expected "in", got "${inToken.value}" at line ${inToken.line}`);
    }
    const iterable = this.parseExpression();
    this.consume('COLON', 'Expected ":" after for expression');
    const body = this.parseBlock();

    return {
      type: 'ForStmt',
      variable,
      iterable,
      body,
      loc: { line: token.line, column: token.column },
    };
  }

  private parseBlock(): ASTNode[] {
    this.consume('NEWLINE', 'Expected newline before block');
    this.consume('INDENT', 'Expected indented block');

    const statements: ASTNode[] = [];
    this.skipNewlines();

    while (!this.check('DEDENT') && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
      this.skipNewlines();
    }

    this.consume('DEDENT', 'Expected dedent at end of block');
    return statements;
  }

  private parseExpression(): ASTNode {
    return this.parseOr();
  }

  private parseOr(): ASTNode {
    let expr = this.parseAnd();

    while (this.checkKeyword('or')) {
      const op = this.advance().value as 'or';
      const right = this.parseAnd();
      expr = {
        type: 'BinaryExpr',
        operator: op,
        left: expr,
        right,
        loc: expr.loc,
      } as BinaryExpr;
    }

    return expr;
  }

  private parseAnd(): ASTNode {
    let expr = this.parseNot();

    while (this.checkKeyword('and')) {
      const op = this.advance().value as 'and';
      const right = this.parseNot();
      expr = {
        type: 'BinaryExpr',
        operator: op,
        left: expr,
        right,
        loc: expr.loc,
      } as BinaryExpr;
    }

    return expr;
  }

  private parseNot(): ASTNode {
    if (this.checkKeyword('not')) {
      const token = this.advance();
      const arg = this.parseNot();
      return {
        type: 'UnaryExpr',
        operator: 'not',
        argument: arg,
        loc: { line: token.line, column: token.column },
      } as UnaryExpr;
    }
    return this.parseComparison();
  }

  private parseComparison(): ASTNode {
    let expr = this.parseAdditive();

    while (this.checkOperator('==', '!=', '<', '<=', '>', '>=') || this.checkKeyword('in')) {
      let op: string;
      if (this.checkKeyword('in')) {
        this.advance();
        op = 'in';
      } else {
        op = this.advance().value;
      }
      const right = this.parseAdditive();
      expr = {
        type: 'BinaryExpr',
        operator: op,
        left: expr,
        right,
        loc: expr.loc,
      } as BinaryExpr;
    }

    return expr;
  }

  private parseAdditive(): ASTNode {
    let expr = this.parseMultiplicative();

    while (this.checkOperator('+', '-')) {
      const op = this.advance().value as '+' | '-';
      const right = this.parseMultiplicative();
      expr = {
        type: 'BinaryExpr',
        operator: op,
        left: expr,
        right,
        loc: expr.loc,
      } as BinaryExpr;
    }

    return expr;
  }

  private parseMultiplicative(): ASTNode {
    let expr = this.parseUnary();

    while (this.checkOperator('*', '/', '%')) {
      const op = this.advance().value as '*' | '/' | '%';
      const right = this.parseUnary();
      expr = {
        type: 'BinaryExpr',
        operator: op,
        left: expr,
        right,
        loc: expr.loc,
      } as BinaryExpr;
    }

    return expr;
  }

  private parseUnary(): ASTNode {
    if (this.checkOperator('-')) {
      const token = this.advance();
      const right = this.parseUnary();
      return {
        type: 'UnaryExpr',
        operator: '-',
        argument: right,
        loc: { line: token.line, column: token.column },
      } as UnaryExpr;
    }
    return this.parseCallMemberIndex();
  }

  private parseCallMemberIndex(): ASTNode {
    let expr = this.parsePrimary();

    while (true) {
      if (this.match('LPAREN')) {
        // Function call: expr(args)
        const args: ASTNode[] = [];
        if (!this.check('RPAREN')) {
          do {
            args.push(this.parseExpression());
          } while (this.match('COMMA'));
        }
        this.consume('RPAREN', 'Expected ")" after argument list');
        expr = {
          type: 'CallExpr',
          callee: expr,
          args,
          loc: expr.loc,
        } as CallExpr;
      } else if (this.match('DOT')) {
        // Member access: expr.prop
        const propToken = this.consume('IDENTIFIER', 'Expected property name after "."');
        expr = {
          type: 'MemberExpr',
          object: expr,
          property: propToken.value,
          loc: expr.loc,
        } as MemberExpr;
      } else if (this.match('LBRACKET')) {
        // Index access or slice access: expr[idx] or expr[start:stop:step]
        let startNode: ASTNode | null = null;
        let stopNode: ASTNode | null = null;
        let stepNode: ASTNode | null = null;

        if (this.match('COLON')) {
          if (!this.check('COLON') && !this.check('RBRACKET')) {
            stopNode = this.parseExpression();
          }
          if (this.match('COLON')) {
            if (!this.check('RBRACKET')) {
              stepNode = this.parseExpression();
            }
          }
        } else {
          const firstExpr = this.parseExpression();
          if (this.match('COLON')) {
            startNode = firstExpr;
            if (!this.check('COLON') && !this.check('RBRACKET')) {
              stopNode = this.parseExpression();
            }
            if (this.match('COLON')) {
              if (!this.check('RBRACKET')) {
                stepNode = this.parseExpression();
              }
            }
          } else {
            this.consume('RBRACKET', 'Expected "]" after index expression');
            expr = {
              type: 'IndexExpr',
              object: expr,
              index: firstExpr,
              loc: expr.loc,
            } as IndexExpr;
            continue;
          }
        }

        this.consume('RBRACKET', 'Expected "]" after slice expression');
        expr = {
          type: 'SliceExpr',
          object: expr,
          start: startNode,
          stop: stopNode,
          step: stepNode,
          loc: expr.loc,
        } as SliceExpr;
      } else {
        break;
      }
    }

    return expr;
  }

  private parsePrimary(): ASTNode {
    const token = this.peek();

    if (token.type === 'NUMBER') {
      this.advance();
      return {
        type: 'NumberLiteral',
        value: Number(token.value),
        loc: { line: token.line, column: token.column },
      } as NumberLiteral;
    }

    if (token.type === 'STRING') {
      this.advance();
      return {
        type: 'StringLiteral',
        value: token.value,
        loc: { line: token.line, column: token.column },
      } as StringLiteral;
    }

    if (token.type === 'KEYWORD') {
      if (token.value === 'True') {
        this.advance();
        return { type: 'BooleanLiteral', value: true, loc: { line: token.line, column: token.column } } as BooleanLiteral;
      }
      if (token.value === 'False') {
        this.advance();
        return { type: 'BooleanLiteral', value: false, loc: { line: token.line, column: token.column } } as BooleanLiteral;
      }
      if (token.value === 'None') {
        this.advance();
        return { type: 'NoneLiteral', loc: { line: token.line, column: token.column } } as NoneLiteral;
      }
    }

    if (token.type === 'IDENTIFIER') {
      this.advance();
      return {
        type: 'Identifier',
        name: token.value,
        loc: { line: token.line, column: token.column },
      } as Identifier;
    }

    if (this.match('LBRACKET')) {
      const elements: ASTNode[] = [];
      if (!this.check('RBRACKET')) {
        do {
          elements.push(this.parseExpression());
        } while (this.match('COMMA'));
      }
      this.consume('RBRACKET', 'Expected "]" after list elements');
      return {
        type: 'ListLiteral',
        elements,
        loc: { line: token.line, column: token.column },
      } as ListLiteral;
    }

    if (this.match('LBRACE')) {
      const entries: DictEntry[] = [];
      if (!this.check('RBRACE')) {
        do {
          if (this.check('RBRACE')) break;
          const key = this.parseExpression();
          this.consume('COLON', 'Expected ":" after dictionary key');
          const value = this.parseExpression();
          entries.push({ key, value });
        } while (this.match('COMMA'));
      }
      this.consume('RBRACE', 'Expected "}" after dictionary entries');
      return {
        type: 'DictLiteral',
        entries,
        loc: { line: token.line, column: token.column },
      } as DictLiteral;
    }

    if (this.match('LPAREN')) {
      const expr = this.parseExpression();
      this.consume('RPAREN', 'Expected ")" after grouped expression');
      return expr;
    }

    throw new Error(`Unexpected token '${token.value || token.type}' at line ${token.line}, column ${token.column}`);
  }

  private checkKeyword(keyword: string): boolean {
    return this.peek().type === 'KEYWORD' && this.peek().value === keyword;
  }

  private checkOperator(...ops: string[]): boolean {
    return this.peek().type === 'OPERATOR' && ops.includes(this.peek().value);
  }

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance();
      return true;
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  private peek(): Token {
    return this.tokens[this.current] || { type: 'EOF', value: '', line: 0, column: 0 };
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, errorMessage: string): Token {
    if (this.check(type)) return this.advance();
    const token = this.peek();

    let tip = '';
    if (type === 'COLON') {
      tip = ' 💡 Tip: Python statements like if, else, for, while, and def must end with a colon (:). Example: if tile.is_empty():';
    } else if (type === 'INDENT') {
      tip = ' 💡 Tip: Code inside an if block, for loop, or function must be indented with Tab or 4 spaces.';
    } else if (type === 'RPAREN') {
      tip = ' 💡 Tip: Make sure every "(" has a matching ")".';
    } else if (type === 'RBRACKET') {
      tip = ' 💡 Tip: Make sure every "[" has a matching "]".';
    }

    throw new Error(`${errorMessage} at line ${token.line}, column ${token.column} (got '${token.value || token.type}').${tip}`);
  }

  private skipNewlines() {
    while (this.check('NEWLINE')) {
      this.advance();
    }
  }

  private expectNewlineOrSemicolon() {
    if (this.check('NEWLINE')) {
      this.advance();
    } else if (!this.isAtEnd() && !this.check('DEDENT')) {
      // allow EOF or dedent without explicit newline
    }
  }
}

