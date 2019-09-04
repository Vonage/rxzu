import { Injectable } from '@angular/core';
import { DiagramModel, PointModel } from '../models';
import * as dagre from 'dagre';
import { GraphLabel, NodeConfig, EdgeConfig } from 'dagre';

export interface DagreEngineOptions {
	graph?: GraphLabel;
	layout?: GraphLabel & NodeConfig & EdgeConfig;
	/**
	 * Will also layout links
	 */
	includeLinks?: boolean;
}

@Injectable()
export class DagreEngine {
	constructor() {}

	redistribute(model: DiagramModel, options: DagreEngineOptions = {}): void {
		const g = new dagre.graphlib.Graph({ multigraph: true });

		g.setGraph(options.graph || {});

		g.setDefaultEdgeLabel(() => {
			return {};
		});

		const processedlinks: { [id: string]: boolean } = {};

		// set nodes
		Object.values(model.getNodes()).forEach(node => {
			g.setNode(node.id, { width: node.getWidth(), height: node.getHeight() });
		});

		Object.values(model.getLinks()).forEach(link => {
			// set edges
			if (link.getSourcePort() && link.getTargetPort()) {
				processedlinks[link.id] = true;
				g.setEdge({
					v: link.getSourcePort().getNode().id,
					w: link.getTargetPort().getNode().id,
					name: link.id
				});
			}
		});

		// layout the graph
		dagre.layout(g, options.layout);

		g.nodes().forEach(v => {
			const { x, y } = g.node(v);
			model.getNode(v).setCoords({ x, y });
		});

		// also include links?
		if (options.includeLinks) {
			g.edges().forEach(e => {
				const edge = g.edge(e);
				const link = model.getLink(e.name);

				const points = [link.getFirstPoint()];
				for (let i = 1; i < edge.points.length - 2; i++) {
					points.push(new PointModel(link, { x: edge.points[i].x, y: edge.points[i].y }));
				}
				link.setPoints(points.concat(link.getLastPoint()));
			});
		}
	}
}
