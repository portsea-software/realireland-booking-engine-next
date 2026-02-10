import { joinURL } from "ufo";
import { getRequestHeader, getQuery } from "h3";

export default defineCachedEventHandler(async (event) => {
	const proxyUrl = useRuntimeConfig().public.engineApiBaseUrl;
	const productId = getRouterParam(event, "productId");
	const query = getQuery(event);
	const targetUrl = joinURL(proxyUrl, `products/${productId}/prices`);

	const currentHeader = getRequestHeader(event, "authorization");
	let authHeader = "";

	if (currentHeader === null || currentHeader === undefined) {
		const token = await getAppToken();
		authHeader = `${token?.token_type} ${token?.access_token}`;
	}
	else {
		authHeader = currentHeader.valueOf();
	}

	return $fetch(targetUrl, {
		method: "GET",
		query,
		headers: { Authorization: authHeader },
	});
}, {
	maxAge: 60 * 60 * 24,
	getKey: (event) => {
		const productId = getRouterParam(event, "productId");
		const query = getQuery(event);
		return `prices:${productId}:${query.fromDate}:${query.toDate}`;
	},
});
