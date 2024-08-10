import { Chart, ChartConfiguration, ChartData, ChartDataset } from "chart.js/auto";
import { collectDateRange, collectNameDate, Timespan } from "./helpers";

export interface Poop {
	name: string;
	date: Date;
}

let selectedName: string = "general";

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
	totalGraph(data, null, "day");
	fillPeopleRadio(data);
}

function fillPeopleRadio(data: Poop[]): void {
	const names: string[] = [];
	for (const {name} of data) {
		if (!names.includes(name)) {
			names.push(name);
		}
	}
	console.log("names:",names);
	
	const container = document.getElementById("namesDropdown");
	const template = container.querySelector("template");
	document.getElementById("namesDropdownSelectionX").classList.add("d-none");
	names.forEach((name, i) => {
		const templateClone = template.content.cloneNode(true) as DocumentFragment;
		templateClone.querySelector("li").id = `namesDropdownSelection${i+1}`;
		templateClone.querySelector("a").innerHTML = name;

		container.appendChild(templateClone);
	});
}

document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("dropdownMenuButton") as HTMLButtonElement;

	button.addEventListener("click", () => {
		const dropdownItems = document.querySelectorAll<HTMLAnchorElement>('#namesDropdown .dropdown-item');

		dropdownItems.forEach((item) => {
			item.addEventListener('click', () => {
				selectedName = item.textContent?.trim();
				console.log(item.textContent?.trim());
				document.getElementById("dropdownMenuButton").innerHTML = selectedName;
			});
		});
	});
});

function updateSelectedName(): void {
}

function avgGraph(data: Poop[], name: string | null, timespan: Timespan): void {
	if (name !== null) {
		data = data.filter(p => p.name === name);
	}

	const collected = collectNameDate(data, timespan);
	const dateLabels = collected.dates.map(date => {
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	})

	const datasets: ChartDataset<"line", number[]>[] = [];
	collected.names.forEach((counts, name) => {
		datasets.push({
			label: name,
			data: counts,
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

function totalGraph(data: Poop[], name: string | null, timespan: Timespan): void {
	if (name !== null) {
		data = data.filter(p => p.name === name);
	}

	const collected = collectNameDate(data, timespan);
	const dateLabels = collected.dates.map(date => {
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	})

	const datasets: ChartDataset<"line", number[]>[] = [];
	collected.names.forEach((counts, name) => {
		let accum = 0;
		const totalCounts: number[] = [];
		for (const count of counts) {
			accum += count;
			totalCounts.push(accum);
		}
		datasets.push({
			label: name,
			data: totalCounts,
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
