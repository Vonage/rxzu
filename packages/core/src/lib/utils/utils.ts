export function toCompRegistryKey(entityType: string, type: string): string {
  return `${entityType}-${type}`;
}
