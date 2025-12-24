const msSecond = 1000;
const msMinute = msSecond * 60;
const msHour = msMinute * 60;
const msDay = msHour * 24;

export function dateDiffDays(date1: Date, date2: Date) {
	const dateDiffMs = Math.abs(date1.getTime() - date2.getTime());

	return Math.round(dateDiffMs / msDay);
}

export function dateDiffNights(date1: Date, date2: Date) {
	return dateDiffDays(date1, date2) - 1;
}

export function addDays(date: Date, days: number) {
	// add days to the date
	const result = new Date(date);
	result.setDate(result.getDate() + days);

	return result;
}

export function addSeconds(date: string, seconds: number) {
	const ms = seconds * msSecond;
	const current = new Date(date);

	return new Date(current.getTime() + ms);
}

export function addDatePickerDays(date: string, days: number) {
	// coerce ISO formated date string to date object
	const current = new Date(date);

	// add days to the date
	const result = new Date(current);
	result.setDate(current.getDate() + days);

	// coerce the date object back to an ISO formatted date string
	return toISODateString(result);
}

export function toISODateString(date: Date) {
	if (date == null) {
		return "";
	}

	return date.toISOString().substring(0, 10);
}

export function parseDateSafe(v: unknown, fallback: Date) {
	const d = new Date(String(v ?? ""));
	return Number.isFinite(d.getTime()) ? d : fallback;
}
