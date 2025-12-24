export default async<ReturnType>(url: string, options = {} as Record<string, any>) => {
	return await $fetch(url, {
		...options,
		headers: {
			...options.headers,
		},
	}) as Promise<ReturnType>;
};
