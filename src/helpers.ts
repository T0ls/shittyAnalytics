import { Poop } from "./index";

export type Timespan = "day" | "week" | "month";

export function roundDate(date: Date, timespan: Timespan): Date {
	const DAY_TIME = 24 * 60 * 60 * 1000;
	let result = new Date(date);
	switch (timespan) {
	case "week":
		const weekDay = result.getDay() - 1;
		const newTime = result.getTime() - DAY_TIME * weekDay;
		result.setTime(newTime);
		// fallthrough
	case "day":
		result.setHours(0, 0, 0, 0);
		break;
	case "month":
		result.setDate(0);
		break;
	}
	return result;
}

export function advanceDate(date: Date, timespan: Timespan): Date {
	const DAY_TIME = 24 * 60 * 60 * 1000;
	let result = new Date(date);
	switch (timespan) {
	case "day":
		result.setTime(result.getTime() + DAY_TIME);
		break;
	case "week":
		result.setTime(result.getTime() + DAY_TIME * 7);
		break;
	case "month":
		const month = result.getMonth();
		if (month >= 12) {
			result.setMonth(0);
			result.setFullYear(result.getFullYear() + 1);
		} else {
			result.setMonth(month + 1);
		}
		break;
	}
	return result;
}

export interface CollectedDate {
	date: Date,
	names: string[]
}

export function collectDateRange(data: Poop[], timespan: Timespan): CollectedDate[] {
	const result: CollectedDate[] = [];
	let names: string[] = [];

	let currentDate = roundDate(data[0].date, timespan);
	let nextDate = advanceDate(currentDate, timespan);

	for (const poop of data) {
		let advanced = false;
		while (poop.date.getTime() > nextDate.getTime()) {
			if (!advanced) {
				result.push({date: currentDate, names})
				names = [];
			}

			currentDate = nextDate;
			nextDate = advanceDate(nextDate, timespan);
			advanced = true;
		}

		names.push(poop.name);
	}

	if (names.length != 0) {
		result.push({date: currentDate, names});
	}

	return result;
}

export interface CollectedDateName {
	names: Map<string, number[]>,
	dates: Date[]
}

export function collectNameDate(data: Poop[], timespan: Timespan): CollectedDateName {
	const collected = collectDateRange(data, timespan);
	const collectedNames: Map<string, number[]> = new Map();
	const dates: Date[] = [];

	for (const {date, names} of collected) {
		dates.push(date);

		const counts: Map<string, number> = new Map();
		names.forEach(n => {
			let newValue = 1;
			if (counts.has(n)) newValue = counts.get(n) + 1;
			counts.set(n, newValue);
		});

		collectedNames.forEach((value, name) => {
			if (counts.has(name)) {
				value.push(counts.get(name));
				counts.delete(name);
			} else {
				value.push(0);
			}
		});
		counts.forEach((value, name) => {
			if (!collectedNames.has(name))
				collectedNames.set(name, [ value ]);
			else
				collectedNames.get(name).push(value);
		});
	}

	return { names: collectedNames, dates };
}
