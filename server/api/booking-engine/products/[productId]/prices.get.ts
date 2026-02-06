import { getQuery } from "h3";

export default createCachedApiHandler({
	getPath: event => `products/${getRouterParam(event, "productId")}/prices`,
	getKey: (event) => {
		const productId = getRouterParam(event, "productId");
		const query = getQuery(event);
		return `prices:${productId}:${query.fromDate}:${query.toDate}`;
	},
});
