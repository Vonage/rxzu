import { NodeModel, LinkModel } from '../models';

export interface SerializedModel {
	nodes: { [i: string]: NodeModel };
	links: { [i: string]: LinkModel };
}
