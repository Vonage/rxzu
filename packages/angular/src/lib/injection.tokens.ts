import { InjectionToken, Type } from '@angular/core';
import { BaseEntityType, BaseModel } from '@rxzu/core';

export const MODEL: InjectionToken<BaseModel> = new InjectionToken('MODEL');

export interface ComponentProviderOptions<T = any> {entityType: BaseEntityType, type: string, comp: Type<T>}

export const COMPONENT: InjectionToken<Omit<ComponentProviderOptions, 'entityType'>> = new InjectionToken('COMPONENT');
