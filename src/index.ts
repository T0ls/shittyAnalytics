import graph from "chart.js";

interface Poop {
	name: string;
	date: Date;
}

window.onload = () => {
	const input: HTMLInputElement = document.querySelector("#fileInput");
	console.log(input);
	input.onchange = _ => {
		const file = input.files[0];
		parseFile(file);
	}
	input.click();
}

function parseFile(file: File): void {
	const reader = new FileReader();
	reader.readAsText(file, 'UTF-8');
	reader.onload = event => {
		const result: Poop[] = [];

		const contentBuf = event.target.result;
		const content = contentBuf.toString();
		const lines = content.split(/\r?\n|\r|\n/g);
		for (const line of lines) {
			console.log(line);
			if (!line.endsWith("💩")) continue;
			const [ dateStr, rest ] = line.split(" - ", 2);
			const endIndex = rest.indexOf(":");
			const name = rest.substring(0, endIndex);
			const date = parseDate(dateStr);

			result.push({ name, date });
		}

		result.sort((a, b) => a.date.getTime() - b.date.getTime());
		initializeGraphs(result);
	}
}

function parseDate(date: string): Date {
	const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{1,2}), (\d{1,2}):(\d{1,2})$/;
	const result = regex.exec(date);
	if (result === null) return new Date(0);
	const parts = result.slice(1).map(v => parseInt(v));
	let [day, month, year, hour, minute] = parts;
	if (year >= 70) { year += 1900; }
	else { year += 2000; }
	return new Date(year, month - 1, day, hour, minute)
}

function initializeGraphs(data: Poop[]): void {
	console.log(data);
}

function averageGraph(data: Poop[], name: string | null, interval: "day" | "week" | "month"): void {
	const DAY_LENGTH = 24 * 60 * 60 * 1000;

	function advanceDate(date: Date, interval: "day" | "week" | "month"): Date {
		date = new Date(date.getTime());
		switch (interval) {
		case "day":	
			date = new Date(date.getTime() + DAY_LENGTH);
			break;
		case "week":
			date = new Date(date.getTime() + DAY_LENGTH * 7);
			break;
		case "month":
			let month = date.getMonth();
			if (++month >= 12) {
				date.setFullYear(date.getFullYear(), 0);
			} else {
				date.setMonth(month);
			}
			break;
		}
		return date;
	}

	if (name !== null) {
		data = data.filter(v => v.name === name);
	}

	const averages = [];
	let currentCount = 0;

	let date = data[0].date;
	switch (interval) {
		case "day":
			date.setHours(0, 0, 0);
		case "week":
			const weekday = date.getDay();
			date = new Date(date.getTime() - DAY_LENGTH * weekday);
			break;
		case "month":
			date.setDate(1);
	}
	let nextDate = advanceDate(date, interval);

	for (const poop of data) {
		while (poop.date.getTime() >= nextDate.getTime()) {
			date = nextDate;
			nextDate = advanceDate(nextDate, interval);
		}

		currentCount++;

	}
}
