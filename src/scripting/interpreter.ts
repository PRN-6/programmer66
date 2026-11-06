import {
  ASTNode,
  Program,
  FunctionDef,
  ReturnStmt,
  IfStmt,
  WhileStmt,
  ForStmt,
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
  ListLiteral,
  DictLiteral,
  SliceExpr,
} from './ast';
import { Environment } from './environment';

export class ReturnSignal {
  constructor(public value: unknown) {}
}

export class BreakSignal {}
export class ContinueSignal {}

export interface InterpreterOptions {
  maxSteps?: number;
  stepDelayMs?: number;
  onPrint?: (msg: string) => void;
  isCancelled?: () => boolean;
}

export class Interpreter {
  private globalEnv: Environment;
  private maxSteps: number;
  private stepCount: number = 0;
  private stepDelayMs: number;
  private onPrint: (msg: string) => void;
  private isCancelled: () => boolean;

  constructor(options: InterpreterOptions = {}) {
    this.maxSteps = options.maxSteps ?? 100000;
    this.stepDelayMs = options.stepDelayMs ?? 50;
    this.onPrint = options.onPrint ?? console.log;
    this.isCancelled = options.isCancelled ?? (() => false);

    this.globalEnv = new Environment();
    this.registerBuiltins();
  }

  public setStepDelay(ms: number) {
    this.stepDelayMs = ms;
  }

  public getGlobalEnv(): Environment {
    return this.globalEnv;
  }

  private registerBuiltins() {
    this.globalEnv.define('print', (...args: unknown[]) => {
      const output = args
        .map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)))
        .join(' ');
      this.onPrint(output);
      return null;
    });

    this.globalEnv.define('range', (...args: number[]) => {
      let start = 0;
      let stop = 0;
      let step = 1;

      if (args.length === 1) {
        stop = args[0];
      } else if (args.length === 2) {
        start = args[0];
        stop = args[1];
      } else if (args.length >= 3) {
        start = args[0];
        stop = args[1];
        step = args[2];
      }

      const result: number[] = [];
      if (step > 0) {
        for (let i = start; i < stop; i += step) {
          result.push(i);
        }
      } else if (step < 0) {
        for (let i = start; i > stop; i += step) {
          result.push(i);
        }
      }
      return result;
    });

    this.globalEnv.define('len', (obj: unknown) => {
      if (Array.isArray(obj) || typeof obj === 'string') {
        return obj.length;
      }
      if (typeof obj === 'object' && obj !== null) {
        return Object.keys(obj).length;
      }
      throw new Error(`TypeError: object of type '${typeof obj}' has no len()`);
    });

    this.globalEnv.define('abs', (val: number) => Math.abs(val));
    this.globalEnv.define('round', (val: number, decimals: number = 0) => {
      const factor = Math.pow(10, decimals);
      return Math.round(val * factor) / factor;
    });
    this.globalEnv.define('min', (...args: unknown[]) => {
      const flat = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      return Math.min(...(flat as number[]));
    });
    this.globalEnv.define('max', (...args: unknown[]) => {
      const flat = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      return Math.max(...(flat as number[]));
    });
    this.globalEnv.define('int', (val: unknown) => parseInt(String(val), 10));
    this.globalEnv.define('str', (val: unknown) => String(val));
    this.globalEnv.define('dict', () => ({}));
    this.globalEnv.define('list', (arg?: unknown) => {
      if (arg === undefined) return [];
      if (Array.isArray(arg)) return [...arg];
      if (typeof arg === 'string') return arg.split('');
      return [arg];
    });
    this.globalEnv.define('sum', (arr: unknown[]) => {
      if (!Array.isArray(arr)) return 0;
      return arr.reduce((acc: number, v: unknown) => acc + (typeof v === 'number' ? v : 0), 0);
    });
    this.globalEnv.define('sorted', (arr: unknown[]) => {
      if (!Array.isArray(arr)) return [];
      return [...arr].sort((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0));
    });
    this.globalEnv.define('reversed', (arr: unknown[]) => {
      if (!Array.isArray(arr)) return [];
      return [...arr].reverse();
    });
    this.globalEnv.define('sleep', async (seconds: number) => {
      await this.sleep(seconds * 1000);
      return null;
    });
  }

  public async run(program: Program): Promise<unknown> {
    this.stepCount = 0;
    try {
      return await this.executeBlock(program.body, this.globalEnv);
    } catch (err) {
      if (err instanceof ReturnSignal) {
        return err.value;
      }
      throw err;
    }
  }

  private async checkLimits(loc?: { line: number; column: number }) {
    this.stepCount++;
    if (this.stepCount > this.maxSteps) {
      const at = loc ? ` at line ${loc.line}` : '';
      throw new Error(`ExecutionLimitExceeded: Script exceeded limit of ${this.maxSteps} operations${at}. Check for infinite loops.`);
    }

    if (this.isCancelled()) {
      throw new Error('ScriptExecutionCancelled: Execution stopped by user.');
    }

    if (this.stepDelayMs > 0 && this.stepCount % 20 === 0) {
      await this.sleep(1);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isTruthy(val: unknown): boolean {
    if (val === false || val === null || val === undefined || val === 0 || val === '') {
      return false;
    }
    if (Array.isArray(val) && val.length === 0) {
      return false;
    }
    return true;
  }

  private async executeBlock(statements: ASTNode[], env: Environment): Promise<unknown> {
    for (const stmt of statements) {
      await this.checkLimits(stmt.loc);
      await this.executeStatement(stmt, env);
    }
    return null;
  }

  private async executeStatement(node: ASTNode, env: Environment): Promise<void> {
    switch (node.type) {
      case 'FunctionDef': {
        const funcDef = node as FunctionDef;
        const userFunc = async (...callArgs: unknown[]) => {
          const funcEnv = new Environment(env);
          funcDef.params.forEach((param, idx) => {
            funcEnv.define(param, callArgs[idx]);
          });
          try {
            await this.executeBlock(funcDef.body, funcEnv);
            return null;
          } catch (sig) {
            if (sig instanceof ReturnSignal) {
              return sig.value;
            }
            throw sig;
          }
        };
        env.define(funcDef.name, userFunc);
        break;
      }

      case 'ReturnStmt': {
        const retStmt = node as ReturnStmt;
        const val = retStmt.value ? await this.evaluate(retStmt.value, env) : null;
        throw new ReturnSignal(val);
      }

      case 'IfStmt': {
        const ifStmt = node as IfStmt;
        const cond = await this.evaluate(ifStmt.test, env);
        if (this.isTruthy(cond)) {
          const ifEnv = new Environment(env);
          await this.executeBlock(ifStmt.consequent, ifEnv);
          return;
        }

        for (const elif of ifStmt.elifBranches) {
          const elifCond = await this.evaluate(elif.test, env);
          if (this.isTruthy(elifCond)) {
            const elifEnv = new Environment(env);
            await this.executeBlock(elif.body, elifEnv);
            return;
          }
        }

        if (ifStmt.alternate) {
          const elseEnv = new Environment(env);
          await this.executeBlock(ifStmt.alternate, elseEnv);
        }
        break;
      }

      case 'WhileStmt': {
        const whileStmt = node as WhileStmt;
        while (this.isTruthy(await this.evaluate(whileStmt.test, env))) {
          await this.checkLimits(whileStmt.loc);
          if (this.stepDelayMs > 0) {
            await this.sleep(this.stepDelayMs);
          }
          const loopEnv = new Environment(env);
          try {
            await this.executeBlock(whileStmt.body, loopEnv);
          } catch (sig) {
            if (sig instanceof BreakSignal) break;
            if (sig instanceof ContinueSignal) continue;
            throw sig;
          }
        }
        break;
      }

      case 'ForStmt': {
        const forStmt = node as ForStmt;
        const iterable = await this.evaluate(forStmt.iterable, env);
        if (!Array.isArray(iterable)) {
          throw new Error(`TypeError: '${typeof iterable}' object is not iterable at line ${forStmt.loc?.line}`);
        }

        for (const item of iterable) {
          await this.checkLimits(forStmt.loc);
          if (this.stepDelayMs > 0) {
            await this.sleep(this.stepDelayMs);
          }
          const loopEnv = new Environment(env);
          loopEnv.define(forStmt.variable, item);
          try {
            await this.executeBlock(forStmt.body, loopEnv);
          } catch (sig) {
            if (sig instanceof BreakSignal) break;
            if (sig instanceof ContinueSignal) continue;
            throw sig;
          }
        }
        break;
      }

      case 'BreakStmt':
        throw new BreakSignal();

      case 'ContinueStmt':
        throw new ContinueSignal();

      case 'PassStmt':
        break;

      case 'AssignStmt': {
        const assign = node as AssignStmt;
        const val = await this.evaluate(assign.value, env);
        if (assign.target.type === 'Identifier') {
          env.set((assign.target as Identifier).name, val);
        } else if (assign.target.type === 'MemberExpr') {
          const mem = assign.target as MemberExpr;
          const obj = (await this.evaluate(mem.object, env)) as Record<string, unknown>;
          if (typeof obj !== 'object' || obj === null) {
            throw new Error(`TypeError: Cannot assign property '${mem.property}' on non-object at line ${mem.loc?.line}`);
          }
          obj[mem.property] = val;
        } else if (assign.target.type === 'IndexExpr') {
          const idxExpr = assign.target as IndexExpr;
          const obj = (await this.evaluate(idxExpr.object, env)) as unknown[];
          const key = (await this.evaluate(idxExpr.index, env)) as number;
          if (Array.isArray(obj)) {
            obj[key] = val;
          } else {
            (obj as unknown as Record<string, unknown>)[String(key)] = val;
          }
        }
        break;
      }

      case 'ExpressionStmt': {
        const exprStmt = node as ExpressionStmt;
        await this.evaluate(exprStmt.expression, env);
        break;
      }

      default:
        throw new Error(`Unknown statement type '${(node as ASTNode).type}'`);
    }
  }

  public async evaluate(node: ASTNode, env: Environment): Promise<unknown> {
    await this.checkLimits(node.loc);

    switch (node.type) {
      case 'NumberLiteral':
        return (node as NumberLiteral).value;

      case 'StringLiteral':
        return (node as StringLiteral).value;

      case 'BooleanLiteral':
        return (node as BooleanLiteral).value;

      case 'NoneLiteral':
        return null;

      case 'Identifier': {
        const id = (node as Identifier).name;
        return env.get(id);
      }

      case 'ListLiteral': {
        const list = node as ListLiteral;
        const results: unknown[] = [];
        for (const el of list.elements) {
          results.push(await this.evaluate(el, env));
        }
        return results;
      }

      case 'UnaryExpr': {
        const un = node as UnaryExpr;
        const arg = await this.evaluate(un.argument, env);
        if (un.operator === '-') {
          return -(arg as number);
        }
        if (un.operator === 'not') {
          return !this.isTruthy(arg);
        }
        throw new Error(`Unknown unary operator '${un.operator}'`);
      }

      case 'BinaryExpr': {
        const bin = node as BinaryExpr;
        const left = await this.evaluate(bin.left, env);

        // Short-circuit logical ops
        if (bin.operator === 'and') {
          if (!this.isTruthy(left)) return left;
          return await this.evaluate(bin.right, env);
        }
        if (bin.operator === 'or') {
          if (this.isTruthy(left)) return left;
          return await this.evaluate(bin.right, env);
        }

        const right = await this.evaluate(bin.right, env);

        switch (bin.operator) {
          case '+':
            if (typeof left === 'number' && typeof right === 'number') return left + right;
            if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right);
            if (Array.isArray(left) && Array.isArray(right)) return [...left, ...right];
            return (left as number) + (right as number);
          case '-':
            return (left as number) - (right as number);
          case '*':
            if (typeof left === 'string' && typeof right === 'number') return left.repeat(right);
            return (left as number) * (right as number);
          case '/':
            return (left as number) / (right as number);
          case '%':
            return (left as number) % (right as number);
          case '==':
            return left === right;
          case '!=':
            return left !== right;
          case '<':
            return (left as number) < (right as number);
          case '<=':
            return (left as number) <= (right as number);
          case '>':
            return (left as number) > (right as number);
          case '>=':
            return (left as number) >= (right as number);
          case 'in':
            if (Array.isArray(right) || typeof right === 'string') {
              return (right as unknown[]).includes(left);
            }
            if (typeof right === 'object' && right !== null) {
              return String(left) in (right as object);
            }
            return false;
          default:
            throw new Error(`Unsupported binary operator '${bin.operator}'`);
        }
      }

      case 'MemberExpr': {
        const mem = node as MemberExpr;
        const obj = (await this.evaluate(mem.object, env)) as Record<string, unknown>;
        if (obj === null || obj === undefined) {
          throw new Error(`AttributeError: 'NoneType' object has no attribute '${mem.property}' at line ${mem.loc?.line}`);
        }
        if (Array.isArray(obj)) {
          if (mem.property === 'append') {
            return (item: unknown) => {
              (obj as unknown[]).push(item);
              return null;
            };
          }
          if (mem.property === 'pop') {
            return () => (obj as unknown[]).pop();
          }
        }
        if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
          if (mem.property === 'keys') {
            return () => Object.keys(obj);
          }
          if (mem.property === 'values') {
            return () => Object.values(obj);
          }
          if (mem.property === 'get') {
            return (k: string | number, defaultVal: unknown = null) => {
              const strKey = String(k);
              return strKey in obj ? obj[strKey] : defaultVal;
            };
          }
        }
        const val = obj[mem.property];
        if (typeof val === 'function') {
          // Bind method to object
          return val.bind(obj);
        }
        return val;
      }

      case 'IndexExpr': {
        const idx = node as IndexExpr;
        const obj = (await this.evaluate(idx.object, env)) as unknown[];
        const key = (await this.evaluate(idx.index, env)) as number;
        if (Array.isArray(obj) || typeof obj === 'string') {
          const index = key < 0 ? obj.length + key : key;
          return obj[index];
        }
        if (typeof obj === 'object' && obj !== null) {
          return (obj as Record<string, unknown>)[String(key)];
        }
        throw new Error(`TypeError: '${typeof obj}' is not subscriptable at line ${idx.loc?.line}`);
      }

      case 'CallExpr': {
        const call = node as CallExpr;
        const callee = await this.evaluate(call.callee, env);
        if (typeof callee !== 'function') {
          throw new Error(`TypeError: '${typeof callee}' object is not callable at line ${call.loc?.line}`);
        }

        const evaluatedArgs: unknown[] = [];
        for (const arg of call.args) {
          evaluatedArgs.push(await this.evaluate(arg, env));
        }

        const res = await callee(...evaluatedArgs);
        return res;
      }

      case 'SliceExpr': {
        const slice = node as SliceExpr;
        const target = (await this.evaluate(slice.object, env)) as unknown[] | string;
        if (!Array.isArray(target) && typeof target !== 'string') {
          throw new Error(`TypeError: '${typeof target}' is not subscriptable/sliceable at line ${slice.loc?.line}`);
        }
        const isStr = typeof target === 'string';
        const len = target.length;
        let step = slice.step ? Number(await this.evaluate(slice.step, env)) : 1;
        if (isNaN(step) || step === 0) step = 1;

        let start: number;
        if (slice.start !== null && slice.start !== undefined) {
          start = Number(await this.evaluate(slice.start, env));
          if (start < 0) start = Math.max(0, len + start);
        } else {
          start = step < 0 ? len - 1 : 0;
        }

        let stop: number;
        if (slice.stop !== null && slice.stop !== undefined) {
          stop = Number(await this.evaluate(slice.stop, env));
          if (stop < 0) stop = Math.max(-1, len + stop);
        } else {
          stop = step < 0 ? -1 : len;
        }

        const res: unknown[] = [];
        if (step > 0) {
          for (let i = start; i < stop && i < len; i += step) {
            res.push(target[i]);
          }
        } else {
          for (let i = start; i > stop && i >= 0; i += step) {
            res.push(target[i]);
          }
        }
        return isStr ? res.join('') : res;
      }

      case 'DictLiteral': {
        const dictNode = node as DictLiteral;
        const dictObj: Record<string, unknown> = {};
        for (const entry of dictNode.entries) {
          const k = await this.evaluate(entry.key, env);
          const v = await this.evaluate(entry.value, env);
          dictObj[String(k)] = v;
        }
        return dictObj;
      }

      default:
        throw new Error(`Unknown expression type '${(node as ASTNode).type}'`);
    }
  }
}

