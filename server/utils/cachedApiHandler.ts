import { joinURL } from "ufo";
import { type H3Event, getRequestHeader, getQuery, readBody, setResponseHeader } from "h3";

type CachedApiOptions = {
	maxAge?: number;
	getKey: (event: H3Event) => string | Promise<string>;
	getPath: (event: H3Event) => string;
	method?: "GET" | "POST";
	passQuery?: boolean;
	passBody?: boolean;
	responseType?: "json" | "arrayBuffer";
	responseHeaders?: Record<string, string> | ((response: any) => Record<string, string>);
};

async function getAuthHeader(event: H3Event): Promise<string> {
	const currentHeader = getRequestHeader(event, "authorization");
	if (currentHeader) {
		return currentHeader.valueOf();
	}
	const token = await getAppToken();
	return `${token?.token_type} ${token?.access_token}`;
}

export function createCachedApiHandler(options: CachedApiOptions) {
	const {
		maxAge = 60 * 60 * 24,
		getKey,
		getPath,
		method = "GET",
		passQuery = method === "GET",
		passBody = method === "POST",
		responseType = "json",
		responseHeaders,
	} = options;

	return defineCachedEventHandler(async (event) => {
		const proxyUrl = useRuntimeConfig().public.engineApiBaseUrl;
		const targetPath = getPath(event);
		const targetUrl = joinURL(proxyUrl, targetPath);
		const authHeader = await getAuthHeader(event);

		const fetchOptions: any = {
			method,
			headers: { Authorization: authHeader },
		};

		if (passQuery && method === "GET") {
			fetchOptions.query = getQuery(event);
		}

		if (passBody && method === "POST") {
			fetchOptions.body = await readBody(event);
		}

		if (responseType === "arrayBuffer") {
			const response = await $fetch.raw(targetUrl, {
				...fetchOptions,
				responseType: "arrayBuffer",
			});

			if (responseHeaders) {
				const headers = typeof responseHeaders === "function"
					? responseHeaders(response)
					: responseHeaders;

				for (const [key, value] of Object.entries(headers)) {
					setResponseHeader(event, key, value);
				}
			}

			return response._data;
		}

		return $fetch(targetUrl, fetchOptions);
	}, {
		maxAge,
		getKey,
	});
}
