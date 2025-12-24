export function parseIntSafe(v: unknown, fallback = 0) {
	const n = Number.parseInt(String(v ?? ""), 10);
	return Number.isFinite(n) ? n : fallback;
}
