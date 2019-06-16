// tslint:disable no-bitwise
// import { ROUTING_SCALING_FACTOR } from './routing/path-finding.service';
// import * as Path from 'paths-js/path';

/**
 * Utility pathing and routing service
 */

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Coords } from '../interfaces/coords.interface';
import { ExcludeOptionalState, ID, IDS, UpdateStateCallback } from '../interfaces/types';
import { BaseEvent, EventOptions } from '../interfaces/event.interface';

export enum LOG_LEVEL {
	'LOG',
	'ERROR'
}

// @internal
export let __DEV__ = true;
// @internal
export let __LOG__: LOG_LEVEL = LOG_LEVEL.ERROR;

export function enableDiagramProdMode(): void {
	__DEV__ = false;
}

// @internal
export function setLogLevel(level: LOG_LEVEL): void {
	__LOG__ = level;
}

// @internal
export function isDev(): boolean {
	return __DEV__;
}

// @internal
export function log<T>(message: string, level: LOG_LEVEL = LOG_LEVEL.LOG, ...args: any[]): void {
	if (isDev() && __LOG__ === level) {
		if (__LOG__ === LOG_LEVEL.ERROR) {
			console.error(message, ...args);
		}
		console.log(message, ...args);
	}
}

/**
 * rxjs log operator
 * @internal
 */
export function withLog(message: string, level: LOG_LEVEL = LOG_LEVEL.LOG, ...args: any) {
	return <T>(source: Observable<T>) => (isDev() ? source.pipe(tap(val => log(message, level, val, ...args))) : source);
}

/**
 * Generates a unique ID
 */
export function UID(): ID {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export function createEvent<E = any>(entityId: ID, events?: E, options?: ExcludeOptionalState<EventOptions>): BaseEvent<E> {
	return {
		id: UID(),
		entityId,
		firing: true,
		stopPropagation: () => (this.firing = false),
		...options,
		...events
	};
}

export function isArray<T>(val: any): val is T[] {
	return Array.isArray(val);
}

export function isString(val: any): val is string {
	return typeof val === 'string';
}

export function isKeyOf<T>(val: any, obj: any): val is keyof T {
	return isString(val) && obj[val] !== undefined;
}

export function isFunction(val: any): val is (...args) => any {
	return typeof val === 'function';
}

export function isObject<T>(val: any): val is T {
	return typeof val === 'object';
}

export function coordsEqual({ x: x1, y: y1 }: Coords, { x: x2, y: y2 }: Coords): boolean {
	return x1 === x2 && y1 === y2;
}

export function arrayCoerece<T>(val: T | T[]): T[] {
	return [].concat(val);
}

export function projectorCoerce<P, R extends Partial<P> = P>(project?: UpdateStateCallback<P, R> | keyof P): (state: Readonly<P>) => R {
	if (isFunction(project)) {
		return project;
	} else if (isString(project)) {
		return state => (state[project] as unknown) as R; // TODO: remove as unknown
	} else {
		return state => state as R;
	}
}

// @internal
export function isNil(v) {
	return v === null || v === undefined;
}

export function coerceArray<T>(value: T | T[]): T[] {
	if (isNil(value)) {
		return [];
	}
	return Array.isArray(value) ? value : [value];
}

export function mapToArray<T>(map: { [key: string]: T }, withKey?: boolean): Array<T & { id: ID }> {
	const result = [];
	for (const key in map) {
		if (!isNil(map[key])) {
			if (withKey) {
				result.push({ id: key, ...map[key] });
			} else {
				result.push(map[key]);
			}
		}
	}

	return result;
}

export function arrayToMap<T>(arr: Array<{ id: ID } & T>): { [key: string]: T } {
	const result = {};
	for (const val of arr) {
		if (!isNil(val)) {
			result[val.id] = val;
		}
	}

	return result;
}

export function generateLinePath(firstPoint: any, lastPoint: any): string {
	return `M${firstPoint.x$},${firstPoint.y} L ${lastPoint.x$},${lastPoint.y}`;
}

export function generateCurvePath(firstPoint: Coords, lastPoint: Coords, curvy: number = 0): string {
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
