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
	g: dagre.graphlib.Graph;
	constructor() {
		try {
			this.g = new dagre.graphlib.Graph({ multigraph: true });
		} catch (error) {
			console.warn("`dagre` packages isn't installed, please install it before using the DagreEngine plugin");
		}
	}

	redistribute(model: DiagramModel, options: DagreEngineOptions = {}): void {
		this.g.setGraph(options.graph || {});

		this.g.setDefaultEdgeLabel(() => {
			return {};
		});

		const processedlinks: { [id: string]: boolean } = {};

		// set nodes
		model.getNodes().forEach(node => {
			this.g.setNode(node.id, { width: node.getWidth(), height: node.getHeight() });
		});

		model.getLinks().forEach(link => {
			// set edges
			if (link.getSourcePort() && link.getTargetPort()) {
				processedlinks[link.id] = true;
				this.g.setEdge({
					v: link.getSourcePort().getNode().id,
					w: link.getTargetPort().getNode().id,
					name: link.id,
				});
			}
		});

		// layout the graph
		dagre.layout(this.g, options.layout);

		this.g.nodes().forEach(v => {
			const { x, y } = this.g.node(v);
			model.getNode(v).setCoords({ x, y });
		});

		// also include links?
		if (options.includeLinks) {
			this.g.edges().forEach(e => {
				const edge = this.g.edge(e);
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
