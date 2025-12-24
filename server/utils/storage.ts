export async function getServerStorageItem<T>(key: string) {
	const storage = useStorage("real_ireland_booking_engine");
	const storageItem = await storage.getItem(key);
	if (storageItem) {
		return storageItem as T;
	}
	return null as T;
}

export async function setServerStorageItem<T>(key: string, item: T | null) {
	const storage = useStorage("real_ireland_booking_engine");
	if (item) {
		await storage.setItem(key, item);
	}
	else {
		await storage.removeItem(key);
	}
}
