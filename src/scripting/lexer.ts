// Lexer for programmer66 Python-like automation language

export type TokenType =
  | 'NUMBER'
  | 'STRING'
  | 'IDENTIFIER'
  | 'KEYWORD'
  | 'OPERATOR'
  | 'COLON'
  | 'COMMA'
  | 'DOT'
  | 'LPAREN'
  | 'RPAREN'
  | 'LBRACKET'
  | 'RBRACKET'
  | 'ASSIGN'
  | 'NEWLINE'
  | 'INDENT'
  | 'DEDENT'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const KEYWORDS = new Set([
  'def',
  'return',
  'if',
  'elif',
  'else',
  'while',
  'for',
  'in',
  'break',
  'continue',
  'pass',
  'and',
  'or',
  'not',
  'True',
  'False',
  'None',
]);

export class Lexer {
  private source: string;
  private pos: number = 0;
  private line: number = 1;
  private col: number = 1;
  private indentStack: number[] = [0];
  private parenDepth: number = 0;
  private atLineStart: boolean = true;

  constructor(source: string) {
    this.source = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.pos < this.source.length) {
      if (this.atLineStart) {
        // Calculate indentation
        const indentTokens = this.handleIndentation();
        tokens.push(...indentTokens);
        this.atLineStart = false;
        if (this.pos >= this.source.length) break;
      }

      const ch = this.source[this.pos];

      // Comment: skip till end of line
      if (ch === '#') {
        while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
          this.advance();
        }
        continue;
      }

      // Horizontal whitespace
      if (ch === ' ' || ch === '\t') {
        this.advance();
        continue;
      }

      // Newline
      if (ch === '\n') {
        const line = this.line;
        const col = this.col;
        this.advance();
        this.atLineStart = true;
        // If we are inside parentheses/brackets, ignore newline
        if (this.parenDepth === 0) {
          // Avoid duplicate newlines
          if (tokens.length > 0 && tokens[tokens.length - 1].type !== 'NEWLINE' && tokens[tokens.length - 1].type !== 'INDENT') {
            tokens.push({ type: 'NEWLINE', value: '\n', line, column: col });
          }
        }
        continue;
      }

      // Numbers
      if (this.isDigit(ch)) {
        tokens.push(this.readNumber());
        continue;
      }

      // Strings (' or ")
      if (ch === '"' || ch === "'") {
        tokens.push(this.readString(ch));
        continue;
      }

      // Identifiers / Keywords
      if (this.isAlpha(ch) || ch === '_') {
        tokens.push(this.readIdentifier());
        continue;
      }

      // Operators and punctuation
      const twoChar = this.source.substring(this.pos, this.pos + 2);
      if (['==', '!=', '<=', '>='].includes(twoChar)) {
        const token: Token = {
          type: 'OPERATOR',
          value: twoChar,
          line: this.line,
          column: this.col,
        };
        this.advance();
        this.advance();
        tokens.push(token);
        continue;
      }

      const singleChar = ch;
      const startLine = this.line;
      const startCol = this.col;
      this.advance();

      switch (singleChar) {
        case '=':
          tokens.push({ type: 'ASSIGN', value: '=', line: startLine, column: startCol });
          break;
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
        case '<':
        case '>':
          tokens.push({ type: 'OPERATOR', value: singleChar, line: startLine, column: startCol });
          break;
        case ':':
          tokens.push({ type: 'COLON', value: ':', line: startLine, column: startCol });
          break;
        case ',':
          tokens.push({ type: 'COMMA', value: ',', line: startLine, column: startCol });
          break;
        case '.':
          tokens.push({ type: 'DOT', value: '.', line: startLine, column: startCol });
          break;
        case '(':
          this.parenDepth++;
          tokens.push({ type: 'LPAREN', value: '(', line: startLine, column: startCol });
          break;
        case ')':
          this.parenDepth = Math.max(0, this.parenDepth - 1);
          tokens.push({ type: 'RPAREN', value: ')', line: startLine, column: startCol });
          break;
        case '[':
          this.parenDepth++;
          tokens.push({ type: 'LBRACKET', value: '[', line: startLine, column: startCol });
          break;
        case ']':
          this.parenDepth = Math.max(0, this.parenDepth - 1);
          tokens.push({ type: 'RBRACKET', value: ']', line: startLine, column: startCol });
          break;
        default:
          throw new Error(`Unexpected character '${singleChar}' at line ${startLine}, col ${startCol}`);
      }
    }

    // Trailing newline if needed
    if (tokens.length > 0 && tokens[tokens.length - 1].type !== 'NEWLINE') {
      tokens.push({ type: 'NEWLINE', value: '\n', line: this.line, column: this.col });
    }

    // Emit remaining DEDENT tokens
    while (this.indentStack.length > 1) {
      this.indentStack.pop();
      tokens.push({ type: 'DEDENT', value: '', line: this.line, column: this.col });
    }

    tokens.push({ type: 'EOF', value: '', line: this.line, column: this.col });
    return tokens;
  }

  private handleIndentation(): Token[] {
    const tokens: Token[] = [];
    const indentCol = this.col;
    let indentCount = 0;

    // Scan leading spaces / tabs
    while (this.pos < this.source.length) {
      const ch = this.source[this.pos];
      if (ch === ' ') {
        indentCount += 1;
        this.advance();
      } else if (ch === '\t') {
        indentCount += 4;
        this.advance();
      } else {
        break;
      }
    }

    // If blank line or comment line, don't emit INDENT/DEDENT
    if (this.pos < this.source.length && (this.source[this.pos] === '\n' || this.source[this.pos] === '#')) {
      return tokens;
    }

    if (this.pos >= this.source.length) {
      return tokens;
    }

    const currentIndent = this.indentStack[this.indentStack.length - 1];

    if (indentCount > currentIndent) {
      this.indentStack.push(indentCount);
      tokens.push({
        type: 'INDENT',
        value: String(indentCount),
        line: this.line,
        column: indentCol,
      });
    } else if (indentCount < currentIndent) {
      while (this.indentStack.length > 1 && this.indentStack[this.indentStack.length - 1] > indentCount) {
        this.indentStack.pop();
        tokens.push({
          type: 'DEDENT',
          value: '',
          line: this.line,
          column: indentCol,
        });
      }
      if (this.indentStack[this.indentStack.length - 1] !== indentCount) {
        throw new Error(`Inconsistent indentation at line ${this.line}`);
      }
    }

    return tokens;
  }

  private readNumber(): Token {
    const startLine = this.line;
    const startCol = this.col;
    let val = '';

    while (this.pos < this.source.length && this.isDigit(this.source[this.pos])) {
      val += this.source[this.pos];
      this.advance();
    }

    if (this.pos < this.source.length && this.source[this.pos] === '.' && this.isDigit(this.source[this.pos + 1] || '')) {
      val += '.';
      this.advance();
      while (this.pos < this.source.length && this.isDigit(this.source[this.pos])) {
        val += this.source[this.pos];
        this.advance();
      }
    }

    return {
      type: 'NUMBER',
      value: val,
      line: startLine,
      column: startCol,
    };
  }

  private readString(quote: string): Token {
    const startLine = this.line;
    const startCol = this.col;
    this.advance(); // skip opening quote
    let val = '';

    while (this.pos < this.source.length && this.source[this.pos] !== quote) {
      if (this.source[this.pos] === '\\' && this.pos + 1 < this.source.length) {
        this.advance();
        const esc = this.source[this.pos];
        if (esc === 'n') val += '\n';
        else if (esc === 't') val += '\t';
        else val += esc;
      } else {
        val += this.source[this.pos];
      }
      this.advance();
    }

    if (this.pos >= this.source.length) {
      throw new Error(`Unterminated string starting at line ${startLine}, col ${startCol}`);
    }

    this.advance(); // skip closing quote

    return {
      type: 'STRING',
      value: val,
      line: startLine,
      column: startCol,
    };
  }

  private readIdentifier(): Token {
    const startLine = this.line;
    const startCol = this.col;
    let val = '';

    while (
      this.pos < this.source.length &&
      (this.isAlphaNumeric(this.source[this.pos]) || this.source[this.pos] === '_')
    ) {
      val += this.source[this.pos];
      this.advance();
    }

    const type = KEYWORDS.has(val) ? 'KEYWORD' : 'IDENTIFIER';

    return {
      type,
      value: val,
      line: startLine,
      column: startCol,
    };
  }

  private advance() {
    if (this.pos < this.source.length) {
      if (this.source[this.pos] === '\n') {
        this.line++;
        this.col = 1;
      } else {
        this.col++;
      }
      this.pos++;
    }
  }

  private isDigit(ch: string): boolean {
    return ch >= '0' && ch <= '9';
  }

  private isAlpha(ch: string): boolean {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
  }

  private isAlphaNumeric(ch: string): boolean {
    return this.isAlpha(ch) || this.isDigit(ch);
  }
}

