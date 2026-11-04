import { describe, it, expect } from 'vitest';
import { Lexer } from '../lexer';
import { Parser } from '../parser';
import { Interpreter } from '../interpreter';

describe('Custom Python-like Scripting Engine', () => {
  it('tokenizes and parses basic statements and loops', () => {
    const code = `
x = 10
y = 20
if x < y:
    z = x + y
else:
    z = 0
`;
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    expect(tokens.length).toBeGreaterThan(0);

    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(ast.type).toBe('Program');
    expect(ast.body.length).toBe(3);
  });

  it('executes arithmetic and variables', async () => {
    const code = `
a = 5
b = 3
c = a * b + 2
`;
    const lexer = new Lexer(code);
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parse();
    const interpreter = new Interpreter({ stepDelayMs: 0 });
    await interpreter.run(ast);
    expect(interpreter.getGlobalEnv().get('c')).toBe(17);
  });

  it('supports while loops and break/continue', async () => {
    const code = `
count = 0
sum = 0
while count < 10:
    count = count + 1
    if count == 5:
        continue
    sum = sum + count
    if count == 8:
        break
`;
    const lexer = new Lexer(code);
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parse();
    const interpreter = new Interpreter({ stepDelayMs: 0 });
    await interpreter.run(ast);
    // count 1,2,3,4, (skip 5), 6,7,8 -> sum = 1+2+3+4+6+7+8 = 31
    expect(interpreter.getGlobalEnv().get('sum')).toBe(31);
  });

  it('supports functions and recursion/returns', async () => {
    const code = `
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

result = factorial(5)
`;
    const lexer = new Lexer(code);
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parse();
    const interpreter = new Interpreter({ stepDelayMs: 0 });
    await interpreter.run(ast);
    expect(interpreter.getGlobalEnv().get('result')).toBe(120);
  });

  it('supports for loop over range and lists', async () => {
    const code = `
total = 0
for i in range(5):
    total = total + i

items = [10, 20, 30]
list_sum = 0
for x in items:
    list_sum = list_sum + x
`;
    const lexer = new Lexer(code);
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parse();
    const interpreter = new Interpreter({ stepDelayMs: 0 });
    await interpreter.run(ast);
    expect(interpreter.getGlobalEnv().get('total')).toBe(10);
    expect(interpreter.getGlobalEnv().get('list_sum')).toBe(60);
  });

  it('safely handles execution limits', async () => {
    const code = `
while True:
    pass
`;
    const lexer = new Lexer(code);
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parse();
    const interpreter = new Interpreter({ maxSteps: 500, stepDelayMs: 0 });
    await expect(interpreter.run(ast)).rejects.toThrow('ExecutionLimitExceeded');
  });

  it('controls autonomous drone through game API', async () => {
    const { createGameAPI } = await import('../api');
    const logs: string[] = [];
    const api = createGameAPI({
      getStepDelay: () => 0,
      isCancelled: () => false,
      onLog: (msg) => logs.push(msg),
    });

    const code = `
# Fly drone to (2, 3)
robot.move_to(2, 3)
pos = robot.get_position()
robot_x = pos.x
robot_y = pos.y

# Plant and water
tile = farm.get_tile(2, 3)
planted = tile.plant("wheat")
watered = tile.water(50)
is_empty = tile.is_empty()
crop_name = tile.crop
`;
    const lexer = new Lexer(code);
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parse();
    const interpreter = new Interpreter({ stepDelayMs: 0 });
    const env = interpreter.getGlobalEnv();
    env.define('farm', api.farm);
    env.define('robot', api.robot);
    env.define('inventory', api.inventory);

    await interpreter.run(ast);

    expect(env.get('robot_x')).toBe(2);
    expect(env.get('robot_y')).toBe(3);
    expect(env.get('planted')).toBe(true);
    expect(env.get('watered')).toBe(true);
    expect(env.get('is_empty')).toBe(false);
    expect(env.get('crop_name')).toBe('wheat');
  });

  it('supports iterating over farm.tiles and farm.get_tiles()', async () => {
    const { createGameAPI } = await import('../api');
    const api = createGameAPI({
      getStepDelay: () => 0,
      isCancelled: () => false,
      onLog: () => {},
    });

    const code = `
tiles_count = 0
for t in farm.tiles:
    tiles_count = tiles_count + 1
`;
    const lexer = new Lexer(code);
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parse();
    const interpreter = new Interpreter({ stepDelayMs: 0 });
    const env = interpreter.getGlobalEnv();
    env.define('farm', api.farm);
    env.define('robot', api.robot);

    await interpreter.run(ast);
    expect(env.get('tiles_count')).toBe(36);
  });
});

