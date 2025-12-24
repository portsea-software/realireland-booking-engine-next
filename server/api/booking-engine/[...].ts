import { joinURL } from "ufo";
import { getRequestHeader } from "#imports";

export default defineEventHandler(async (event) => {
	const proxyUrl = useRuntimeConfig().public.engineApiBaseUrl;
	const targetPath = event.path.replace(/^\/api\/booking-engine\//, "");
	const targetUrl = joinURL(proxyUrl, targetPath);

	const currentHeader = getRequestHeader(event, "authorization");
	let authHeader = "";

	if (currentHeader === null || currentHeader === undefined) {
		const token = await getAppToken();
		authHeader = `${token?.token_type} ${token?.access_token}`;
	}
	else {
		authHeader = currentHeader.valueOf();
	}

	return proxyRequest(event, targetUrl, {
		headers: {
			Authorization: authHeader,
		},
	});
});
