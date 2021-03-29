import { BaseEntityType } from '../interfaces';

export function toRegistryKey(type: BaseEntityType, name = 'default'): string {
  return `${type}-${name}`;
}
