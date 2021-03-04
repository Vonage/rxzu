export abstract class AbstractRegistry<C> {
  private _registry: Map<string, C> = new Map<string, C>();
  private _parent: AbstractRegistry<C> | null;

  constructor(parent: AbstractRegistry<C> | null) {
    this._parent = parent;
  };

  get(type: string): C | undefined {
    return this._registry.get(type) || this._parent?.get(type);
  }

  has(type: string): boolean {
    return this._registry.has(type) || !!this._parent?.has(type);
  }

  set(type: string, component: C) {
    this._registry.set(type, component);
  }

  clear() {
    this._registry.clear()
  }

  delete(type: string) {
    this._registry.delete(type);
  }
}
