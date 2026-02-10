import { joinURL } from "ufo";
import { getRequestHeader } from "h3";

export default defineCachedEventHandler(async (event) => {
	const proxyUrl = useRuntimeConfig().public.engineApiBaseUrl;
	const productId = getRouterParam(event, "productId");
	const targetUrl = joinURL(proxyUrl, `products/${productId}/images`);

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
		headers: { Authorization: authHeader },
	});
}, {
	maxAge: 60 * 60 * 24,
	getKey: event => `images:${getRouterParam(event, "productId")}`,
});
