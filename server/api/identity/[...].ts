import { joinURL } from "ufo";
import { getRequestHeader } from "#imports";

export default defineEventHandler(async (event) => {
	const proxyUrl = useRuntimeConfig().authBaseUrl;
	const targetPath = event.path.replace(/^\/api\/identity\//, "");
	const targetUrl = joinURL(proxyUrl, targetPath);

	const currentHeader = getRequestHeader(event, "authorization");
	let authHeader = "";

	if (currentHeader) {
		authHeader = currentHeader.valueOf();
	}
	else {
		const token = await getAppToken();
		authHeader = `${token?.token_type} ${token?.access_token}`;
	}

	return proxyRequest(event, targetUrl, {
		headers: {
			Authorization: authHeader,
		},
	});
});
