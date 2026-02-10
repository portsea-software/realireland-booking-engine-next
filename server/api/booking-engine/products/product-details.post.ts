import { joinURL } from "ufo";
import { getRequestHeader, readBody } from "h3";

export default defineCachedEventHandler(async (event) => {
	const proxyUrl = useRuntimeConfig().public.engineApiBaseUrl;
	const targetUrl = joinURL(proxyUrl, "products/product-details");
	const body = await readBody(event);

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
		method: "POST",
		body,
		headers: { Authorization: authHeader },
	});
}, {
	maxAge: 60 * 60 * 24,
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
