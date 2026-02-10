import { joinURL } from "ufo";
import { getRequestHeader, setResponseHeader } from "h3";

export default defineCachedEventHandler(async (event) => {
	const proxyUrl = useRuntimeConfig().public.engineApiBaseUrl;
	const productId = getRouterParam(event, "productId");
	const imageId = getRouterParam(event, "imageId");
	const targetUrl = joinURL(proxyUrl, `products/${productId}/images/${imageId}`);

	const currentHeader = getRequestHeader(event, "authorization");
	let authHeader = "";

	if (currentHeader === null || currentHeader === undefined) {
		const token = await getAppToken();
		authHeader = `${token?.token_type} ${token?.access_token}`;
	}
	else {
		authHeader = currentHeader.valueOf();
	}

	const response = await $fetch.raw(targetUrl, {
		method: "GET",
		headers: { Authorization: authHeader },
		responseType: "arrayBuffer",
	});

	const contentType = response.headers.get("content-type") || "image/jpeg";
	setResponseHeader(event, "content-type", contentType);

	return response._data;
}, {
	maxAge: 60 * 60 * 24,
	getKey: (event) => {
		const productId = getRouterParam(event, "productId");
		const imageId = getRouterParam(event, "imageId");
		return `image:${productId}:${imageId}`;
	},
});
