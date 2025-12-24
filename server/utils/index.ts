export const handleError = (error: any) => {
	const generalMessage = "An unexpected error occurred";
	let statusCode = 500;
	let statusMessage = "Unexpected error";
	let message = generalMessage;
	let data = undefined;

	console.log("Error", error);

	// Extract details from error response
	if (error.response) {
		statusCode = error.response.status;
		statusMessage = error.response.statusText;
		data = error.response._data && error.response._data.errors ? error.response._data.errors : undefined;
		if (import.meta.server) {
			message = error.response._data && error.response._data.detail ? error.response._data.detail : error.response._data.title;
		}
		if (import.meta.client) {
			message = error.response._data && error.response._data.detail ? error.response._data.detail : generalMessage;
			// if (error.statusCode === 401 && error.statusMessage === "Unauthorized") {
			// 	sendRedirect()
			// }
		}
	}

	return {
		statusCode,
		statusMessage,
		message,
		data,
	};
};
