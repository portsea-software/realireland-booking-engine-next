import { readBody } from "h3";

export default createCachedApiHandler({
	method: "POST",
	getPath: () => "products/product-details",
	getKey: async (event) => {
		const body = await readBody(event);
		const key = JSON.stringify({
			filters: body?.filters || [],
			pageNo: body?.pageNo || 1,
			rowCount: body?.rowCount || 100,
		});
		return `product-details:${key}`;
	},
});
