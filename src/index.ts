import { Chart, ChartConfiguration, ChartData, ChartDataset } from "chart.js/auto";
import { collectDateRange, Timespan } from "./helpers";

export interface Poop {
	name: string;
	date: Date;
}

document.addEventListener("DOMContentLoaded", evt => {
	const input: HTMLInputElement = document.querySelector("#formFile");
	input.onchange = _ => {
		const file = input.files[0];
		parseFile(file);
	}
});

function parseFile(file: File): void {
	const reader = new FileReader();
	reader.readAsText(file, 'UTF-8');
	reader.onload = event => {
		const result: Poop[] = [];

		const contentBuf = event.target.result;
		const content = contentBuf.toString();
		const lines = content.split(/\r?\n|\r|\n/g);
		for (const line of lines) {
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
	avgGraph(data, null, "day");
}

function avgGraph(data: Poop[], name: string | null, timespan: Timespan): void {
	if (name !== null) {
		data = data.filter(p => p.name === name);
	}

	const collected = collectDateRange(data, timespan);
	const collectedByName: Map<string, number[]> = new Map();
	const dateLabels: string[] = [];

	for (const {date, names} of collected) {
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		const dateStr = `${day}/${month}/${year}`;
		dateLabels.push(dateStr);

		const counts: Map<string, number> = new Map();
		names.forEach(n => {
			let newValue = 1;
			if (counts.has(n)) newValue = counts.get(n) + 1;
			counts.set(n, newValue);
		});
		counts.forEach((value, name) => {
			if (!collectedByName.has(name)) {
				collectedByName.set(name, []);
			}
			collectedByName.get(name).push(value);
		});
	}

	const datasets: ChartDataset<"line", number[]>[] = [];
	collectedByName.forEach((counts, name) => {
		const padding = Array(dateLabels.length - counts.length).fill(0);
		const paddedCounts = counts.concat(padding);
		datasets.push({
			label: name,
			data: paddedCounts,
			fill: true
		});
	});
	const chartData: ChartData<"line", number[], string> = {
		labels: dateLabels,
		datasets
	}

	const graphCfg: ChartConfiguration<"line", number[], string> = {
		type: "line",
		data: chartData,
		options: {
			responsive: true,
			plugins: {
				tooltip: {
					mode: "index"
				}
			},
			interaction: {
				mode: "nearest",
				axis: "x",
				intersect: false
			},
			scales: {
				x: {
					title: {
						display: true,
						text: "Date"
					}
				},
				y: {
					stacked: true,
					title: {
						display: true,
						text: "Poops"
					}
				}
			}
		}
	};

	const canvas: HTMLCanvasElement = document.querySelector("#totalStackGraph");
	new Chart(canvas, graphCfg);
}
