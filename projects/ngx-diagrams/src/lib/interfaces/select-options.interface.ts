export interface SelectOptions<E> {
	// asObject?: boolean;
	filter?: ((entity: E) => boolean) | undefined;
	// limitTo?: number;
}
