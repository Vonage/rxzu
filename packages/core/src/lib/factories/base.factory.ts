import { BaseModel, DiagramModel } from '../models';
import { AbstractRegistry } from './base.registry';
import { Observable, Subject } from 'rxjs';
import { toRegistryKey } from '../utils';

export interface WidgetOptions<M, H> {
  model: M;
  host: H;
  index?: number;
  diagramModel?: DiagramModel;
}

export abstract class AbstractFactory<
  CompType = any,
  WidgetType = any,
  ResolvedType = WidgetType
> {
  protected _registry: AbstractRegistry<CompType>;
  private _beforeGenerate$: Subject<void>;
  private _afterGenerate$: Subject<ResolvedType | null>;

  constructor(registry: AbstractRegistry<CompType>) {
    this._registry = registry;
    this._beforeGenerate$ = new Subject();
    this._afterGenerate$ = new Subject();
  }

  abstract resolveComponent(options: WidgetOptions<any, any>): ResolvedType;

  abstract getHTMLElement(widget: ResolvedType): HTMLElement;

  abstract destroyWidget(widget: ResolvedType): void;

  abstract detectChanges(widget: ResolvedType): void;

  beforeGenerate(): Observable<void> {
    return this._beforeGenerate$.asObservable();
  }

  afterGenerate(): Observable<ResolvedType | null> {
    return this._afterGenerate$.asObservable();
  }

  has<M extends BaseModel>(model: M): boolean {
    return this._registry.has(toRegistryKey(model.type, model.namespace));
  }

  generateWidget<M extends BaseModel>(
    options: WidgetOptions<M, any>
  ): WidgetType | null {
    if (!this.resolveComponent)
      throw new Error('resolveComponent is not implemented');
    if (options.model.getPainted().isPainted) return null;
    this._beforeGenerate$.next();
    const widget = this.resolveComponent(options);
    const element = this.getHTMLElement(widget);

    element.setAttribute('data-type', options.model.type);
    element.setAttribute('data-id', options.model.id);
    element.setAttribute('data-parent-id', options.model.getParent()?.id);
    element.setAttribute('data-namespace', options.model.namespace);

    this._afterGenerate$.next(widget);

    this.detectChanges(widget);

    return (widget as unknown) as WidgetType;
  }

  protected get<M extends BaseModel>(model: M): CompType | undefined {
    return this._registry.get(toRegistryKey(model.type, model.namespace));
  }
}
