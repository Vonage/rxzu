import { LinkModel } from '../models/link.model';
import { AbstractFactory } from './base.factory';
import { ViewContainerRef, ComponentRef } from '@angular/core';
import { DiagramEngine } from '../services/engine.service';

export abstract class AbstractLinkFactory<T extends LinkModel = LinkModel> extends AbstractFactory<T> {
	abstract generateWidget(diagramEngine: DiagramEngine, link: LinkModel, linksHost: ViewContainerRef): ComponentRef<T>;
}
