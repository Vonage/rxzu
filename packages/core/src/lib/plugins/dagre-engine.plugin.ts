import { DiagramModel, PointModel } from '@rxzu/core';
import { EdgeConfig, GraphLabel, NodeConfig, graphlib, layout } from 'dagre';

export interface DagreEngineOptions {
  graph?: GraphLabel;
  layout?: GraphLabel & NodeConfig & EdgeConfig;
  /**
   * Will also layout links
   */
  includeLinks?: boolean;
}

export class DagrePlugin {
  g!: graphlib.Graph;

  instantiate() {
    try {
      this.g = new graphlib.Graph({ multigraph: true });
    } catch (error) {
      console.warn(
        "`dagre` packages isn't installed, please install it before using the DagreEngine plugin"
      );
    }
  }

  redistribute(model: DiagramModel, options: DagreEngineOptions = {}): void {
    this.instantiate();
    this.g.setGraph(options.graph || {});

    this.g.setDefaultEdgeLabel(() => {
      return {};
    });

    const processedlinks: { [id: string]: boolean } = {};

    // set nodes
    model.getNodes().forEach((node) => {
      this.g.setNode(node.id, {
        width: node.getWidth(),
        height: node.getHeight(),
      });
    });

    model.getLinks().forEach((link) => {
      // set edges
      if (link.getSourcePort() && link.getTargetPort()) {
        processedlinks[link.id] = true;
        const v = link.getSourcePort()?.getNode()?.id;
        const w = link.getTargetPort()?.getNode()?.id;
        v &&
          w &&
          this.g.setEdge({
            v,
            w,
            name: link.id,
          });
      }
    });

    // layout the graph
    layout(this.g, options.layout);

    this.g.nodes().forEach((v) => {
      // returns the width, height, the x-coordinate of the center of the node, and the y-coordinate of the center of the node
      const { x, y, width, height } = this.g.node(v);
      // update the new coordinates of the node
      model.getNode(v)?.setCoords({ x: x - width / 2, y: y - height / 2 });
    });

    // also include links?
    if (options.includeLinks) {
      this.g.edges().forEach((e) => {
        const edge = this.g.edge(e);
        const link = model.getLink(e.name);

        if (link) {
          const points = [link?.getFirstPoint()];
          for (let i = 1; i < edge.points.length - 2; i++) {
            points.push(
              new PointModel({
                parent: link,
                coords: { x: edge.points[i].x, y: edge.points[i].y },
              })
            );
          }
          link?.setPoints(points.concat(link?.getLastPoint()));
        }
      });
    }
  }
}
