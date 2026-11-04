// Environment and scope manager for FARMING 68 scripting

export class Environment {
  private values: Map<string, unknown> = new Map();
  private parent: Environment | null = null;

  constructor(parent: Environment | null = null) {
    this.parent = parent;
  }

  public define(name: string, value: unknown) {
    this.values.set(name, value);
  }

  public set(name: string, value: unknown) {
    if (this.values.has(name)) {
      this.values.set(name, value);
      return;
    }
    if (this.parent) {
      this.parent.set(name, value);
      return;
    }
    // In Python, assigning to an undeclared variable creates it in local scope
    this.values.set(name, value);
  }

  public get(name: string): unknown {
    if (this.values.has(name)) {
      return this.values.get(name);
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    throw new Error(`NameError: name '${name}' is not defined`);
  }

  public has(name: string): boolean {
    if (this.values.has(name)) return true;
    if (this.parent) return this.parent.has(name);
    return false;
  }
}

