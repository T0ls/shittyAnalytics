import { Chart, ChartConfiguration, ChartData, ChartDataset } from "chart.js/auto";
import { collectName, collectNameDate, Timespan } from "./helpers";
import { globalState } from "./index";

interface Graphs {
	totalStack: Chart<"line", number[], string> | null
	totalPie: Chart<"pie", number[], string> | null
}

// Object containg all the graphs objects
// When initialized the graphs will contain no data
const graphs: Graphs = {
	totalStack: null,
	totalPie: null,
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
	// Initialize totalPieGraph
	const totalPieCfg: ChartConfiguration<"pie", number[], string> = {
		type: "pie",
		data: {
			labels: [],
			datasets: []
		},
		options: {
			responsive: true,
			plugins: {
				legend: {
					position: "top"
				}
			}
		}
	}
	const totalPieCtx: HTMLCanvasElement = document.querySelector("#totalPieGraph");
	graphs.totalPie = new Chart(totalPieCtx, totalPieCfg);
}

// Updates the total stack graph based on the config
// The initializeGraphs() must be called before this function
export function updateTotalStack(timespan: Timespan): void {
	const graph = graphs.totalStack;
	if (graph === null) return;

	let data = globalState.data;
	if (globalState.selectedNames !== null && globalState.selectedNames.length > 0) {
		data = data.filter(p => globalState.selectedNames.some(name => p.name === name));
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
			fill: true,
			backgroundColor: globalState.nameColor.get(name)
		});
	});
	const chartData: ChartData<"line", number[], string> = {
		labels: dateLabels,
		datasets
	}

	graph.data = chartData;
	graph.update("show");
}

// Updates the total pie graph based on the config
// The initializeGraphs() must be called before this function
export function updateTotalPie(): void {
	const graph = graphs.totalPie;
	if (graph === null) return;

	let data = globalState.data;
	if (globalState.selectedNames !== null && globalState.selectedNames.length > 0) {
		data = data.filter(p => globalState.selectedNames.some(name => p.name === name));
	}

	const totals = collectName(data);

	const entries = Array.from(totals.entries()).sort((a, b) => a[1] - b[1]);
	const labels = entries.map(e => e[0]);
	const values = entries.map(e => e[1]);
	const colors = labels.map(name => globalState.nameColor.get(name));

	const chartData: ChartData<"pie", number[], string> = {
		labels,
		datasets: [{
			data: values,
			backgroundColor: colors
		}]
	};

	graph.data = chartData;
	graph.update("show");
}

/*
export function avgGraph(timespan: Timespan): void {
	let data = globalState.data;
	if (globalState.selectedNames !== null) {
		data = data.filter(p => p.name === globalState.selectedNames);
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
