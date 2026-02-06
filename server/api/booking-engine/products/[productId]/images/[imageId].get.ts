export default createCachedApiHandler({
	getPath: (event) => {
		const productId = getRouterParam(event, "productId");
		const imageId = getRouterParam(event, "imageId");
		return `products/${productId}/images/${imageId}`;
	},
	getKey: (event) => {
		const productId = getRouterParam(event, "productId");
		const imageId = getRouterParam(event, "imageId");
		return `image:${productId}:${imageId}`;
	},
	responseType: "arrayBuffer",
	responseHeaders: response => ({
		"content-type": response.headers.get("content-type") || "image/jpeg",
	}),
});
