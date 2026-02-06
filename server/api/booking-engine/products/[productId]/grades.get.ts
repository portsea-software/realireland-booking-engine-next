export default createCachedApiHandler({
	getPath: event => `products/${getRouterParam(event, "productId")}/grades`,
	getKey: event => `grades:${getRouterParam(event, "productId")}`,
});
