import { ID } from './tool-kit.util';

export type HashMap<T> = Record<string, T>;

export type Entries<T, K = string> = (readonly [K, T])[];

export type EntityMap<T> = Map<ID, T>;
