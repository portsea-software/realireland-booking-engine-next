export default createCachedApiHandler({
	getPath: event => `products/${getRouterParam(event, "productId")}/images`,
	getKey: event => `images:${getRouterParam(event, "productId")}`,
});
