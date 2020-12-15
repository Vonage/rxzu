import { ID } from './tool-kit.util';

export interface HashMap<T> {
  [key: string]: T;
}

export type Entries<T, K = string> = (readonly [K, T])[];

export type EntityMap<T> = Map<ID, T>;
