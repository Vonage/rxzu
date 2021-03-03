import { BaseEntityType } from '../interfaces';

export function toRegistryKey(type: BaseEntityType, name: string): string {
  return `${type}-${name}`;
}
