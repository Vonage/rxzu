import { BaseEntityOptions, DiagramModelOptions } from './options.interface';

export type EngineSetup = Omit<DiagramModelOptions, keyof BaseEntityOptions>;
