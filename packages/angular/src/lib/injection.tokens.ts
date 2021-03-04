import { InjectionToken, Type } from '@angular/core';
import { BaseEntityType, BaseModel, EngineSetup } from '@rxzu/core';

export const MODEL: InjectionToken<BaseModel> = new InjectionToken('MODEL');

export interface ComponentProviderOptions<T = any> {
  type: BaseEntityType,
  name: string,
  component: Type<T>
}

export const COMPONENT: InjectionToken<Omit<ComponentProviderOptions, 'type'>> = new InjectionToken('COMPONENT');

export const DIAGRAM_DEFAULT_OPTIONS: InjectionToken<EngineSetup> = new InjectionToken('DIAGRAM_DEFAULT_OPTIONS', {
  providedIn: 'root',
  factory: function() {
    return {
      allowCanvasZoom: true,
      allowCanvasTranslation: true,
      inverseZoom: true,
      allowLooseLinks: true,
      maxZoomOut: 0,
      maxZoomIn: 0,
      portMagneticRadius: 30
    } as EngineSetup
  }
})
