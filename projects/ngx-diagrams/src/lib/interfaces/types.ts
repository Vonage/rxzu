export type UpdateStateCallback<S, R extends Partial<S> = Partial<S>> = (s: Readonly<S>) => R;
export type ID = string;
export type IDS = ID | ID[];
export type BaseEntityType = 'node' | 'link' | 'port' | 'point';
export type RequiredKeys<T> = { [K in keyof T]-?: ({} extends { [P in K]: T[K] } ? never : K) }[keyof T];
export type OptionalKeys<T> = { [K in keyof T]-?: ({} extends { [P in K]: T[K] } ? K : never) }[keyof T];
export type ExcludeOptionalState<T> = Pick<T, RequiredKeys<T>>;
