const APP_TOKEN_KEY = "real_ireland_booking_engine_app_token";

export const getAppToken = async () => {
	const token = await getServerStorageItem<AccessToken | null>(APP_TOKEN_KEY);
	if (token) {
		return token;
	}
	return null;
};

export const fetchAppToken = async () => {
	const { public: { authTokenUrl }, grantType, clientId, clientSecret } = useRuntimeConfig();

	const formData = new URLSearchParams();
	formData.append("grant_type", grantType);
	formData.append("client_id", clientId);
	formData.append("client_secret", clientSecret);

	console.log(grantType, clientId, clientSecret);

	await $fetch<AccessToken>(`${authTokenUrl}/connect/token`, {
		method: "POST",
		body: formData.toString(),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded", // the crucial bit
		},
	}).then(async (res) => {
		console.log("res", res);
		await setServerStorageItem<AccessToken>(APP_TOKEN_KEY, res);
	}).catch((err) => {
		// const updatedError = handleError(err);
		// throw createError(updatedError);
		console.log("Error", err);
	});
};
export function isTokenExpired(token: AccessToken | null) {
	if (token) {
		const currentTime = new Date();
		const expiresAt = new Date(token.expires);
		return currentTime >= expiresAt;
	}
	return true;
}
