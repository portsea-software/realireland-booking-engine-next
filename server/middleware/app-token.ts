// This will run for every server request and rightly so because we app token for every request
export default defineEventHandler(async (event) => {
	if (event.node.req.url?.includes("api")) {
		const token = await getAppToken();

		if (!token || isTokenExpired(token)) {
			await fetchAppToken();
		}
	}
});
