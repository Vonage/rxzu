// tslint:disable no-bitwise
// import { ROUTING_SCALING_FACTOR } from './routing/path-finding.service';
// import * as Path from 'paths-js/path';

/**
 * Utility pathing and routing service
 */

/**
 * Generates a unique ID
 */
export function UID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export function generateLinePath(firstPoint: any, lastPoint: any): string {
	return `M${firstPoint.x},${firstPoint.y} L ${lastPoint.x},${lastPoint.y}`;
}

export function generateCurvePath(firstPoint: { x: number; y: number }, lastPoint: { x: number; y: number }, curvy: number = 0): string {
	const isHorizontal = Math.abs(firstPoint.x - lastPoint.x) > Math.abs(firstPoint.y - lastPoint.y);
	const curvyX = isHorizontal ? curvy : 0;
	const curvyY = isHorizontal ? 0 : curvy;

	return `M${firstPoint.x},${firstPoint.y} C ${firstPoint.x + curvyX},${firstPoint.y + curvyY}
    ${lastPoint.x - curvyX},${lastPoint.y - curvyY} ${lastPoint.x},${lastPoint.y}`;
}

// export function generateDynamicPath(pathCoords: number[][]) {
//     let path = Path();
//     path = path.moveto(pathCoords[0][0] * ROUTING_SCALING_FACTOR, pathCoords[0][1] * ROUTING_SCALING_FACTOR);
//     pathCoords.slice(1).forEach(coords => {
//         path = path.lineto(coords[0] * ROUTING_SCALING_FACTOR, coords[1] * ROUTING_SCALING_FACTOR);
//     });
//     return path.print();
// }
