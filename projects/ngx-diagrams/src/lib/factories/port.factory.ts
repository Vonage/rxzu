import { PortModel } from '../models/port.model';
import { AbstractFactory } from './base.factory';

export abstract class AbstractPortFactory<T extends PortModel = PortModel> extends AbstractFactory<T> {}
