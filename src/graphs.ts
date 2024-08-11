import { Chart, ChartConfiguration, ChartData, ChartDataset } from "chart.js/auto";
import { collectNameDate, Timespan } from "./helpers";
import { globalState } from "./index";

interface Graphs {
	totalStack: Chart<"line", number[], string> | null
}

// Object containg all the graphs objects
// When initialized the graphs will contain no data
const graphs: Graphs = {
	totalStack: null
}

export function initializeGraphs(): void {
	// Initialize totalStack graph
	const totalStackCfg: ChartConfiguration<"line", number[], string> = {
		type: "line",
		data: {
			labels: [],
			datasets: []
		},
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
	const totalStackCtx: HTMLCanvasElement = document.querySelector("#totalStackGraph");
	graphs.totalStack = new Chart(totalStackCtx, totalStackCfg);
}

// Updates the total stack graph based on the config
// The initializeGraphs() must be called before this function
export function updateTotalStack(timespan: Timespan): void {
	const graph = graphs.totalStack;
	if (graph === null) return;

	let data = globalState.data;
	if (globalState.selectedName !== null) {
		data = data.filter(p => p.name === globalState.selectedName);
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

	graph.data = chartData;
	graph.update("show");
}

/*
export function avgGraph(timespan: Timespan): void {
	let data = globalState.data;
	if (globalState.selectedName !== null) {
		data = data.filter(p => p.name === globalState.selectedName);
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
*/
