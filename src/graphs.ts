import { Chart, ChartConfiguration, ChartData, ChartDataset } from "chart.js/auto";
import { collectDateRange, collectNameDate, Timespan } from "./helpers";
import { Poop } from "./index";

export function avgGraph(data: Poop[], name: string | null, timespan: Timespan): void {
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

export function totalGraph(data: Poop[], name: string | null, timespan: Timespan): void {
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
