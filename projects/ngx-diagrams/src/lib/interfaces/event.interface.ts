import { ID } from './types';

export interface EventOptions {
	entityId?: ID;
	stopPropagation: () => any;
	firing: boolean;
}
export type BaseEvent<E = any> = Required<EventOptions> &
	{
		// @ts-ignore
		[K in keyof E]: E[K]
	};
