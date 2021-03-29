export abstract class AbstractRegistry<C> {
  private _registry: Map<string, C> = new Map<string, C>();
  private _parent: AbstractRegistry<C> | null;

  constructor(parent: AbstractRegistry<C> | null) {
    this._parent = parent;
  };

  get(key: string): C | undefined {
    return this._registry.get(key) || this._parent?.get(key);
  }

  has(key: string): boolean {
    return this._registry.has(key) || !!this._parent?.has(key);
  }

  set(key: string, component: C) {
    this._registry.set(key, component);
  }

  clear() {
    this._registry.clear()
  }

  delete(key: string) {
    this._registry.delete(key);
  }
}
