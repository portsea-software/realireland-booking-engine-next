export default createCachedApiHandler({
	getPath: event => `products/${getRouterParam(event, "productId")}/elements`,
	getKey: event => `elements:${getRouterParam(event, "productId")}`,
});
