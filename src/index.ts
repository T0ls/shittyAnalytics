import { initializeGraphs, updateTotalPie, updateTotalStack } from "./graphs";

export interface Poop {
	name: string;
	date: Date;
}

export interface GlobalState {
	data: Poop[],
	selectedNames: string[],
	nameColor: Map<string, string>,
}

export const globalState: GlobalState = {
	data: [],
	selectedNames: [],
	nameColor: new Map(),
}

document.addEventListener('DOMContentLoaded', _ => {
	// Evento per fileInput
	const input: HTMLInputElement = document.querySelector("#formFile");
	input.addEventListener("change", _ => {
		globalState.selectedNames = [];
    	parseFile(input.files[0]);
	});
});

export function updateSelectedNames(name: string, checkStatus: boolean) {
	if (checkStatus) {
		globalState.selectedNames.push(name);	
	} else {
		globalState.selectedNames = globalState.selectedNames.filter(n => n !== name);
	}
	console.log("GlobalState.selectedNames",globalState.selectedNames);
}
// Add function to the "window" object 
(window as any).updateSelectedNames = updateSelectedNames;

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
		globalState.data = result;
		onParse();
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

// Function called when new data is parsed, it must initialize everything based on the data
// The data is passed through the globalState
function onParse(): void {
	globalState.nameColor = new Map();
	fillPeopleRadio();
	drawGraphs();
}

// Function called when graphs require an update
// All the configuration and data is passed through the globalState
function drawGraphs(): void {
	updateTotalStack("day");
	updateTotalPie();
}

function fillPeopleRadio(): void {
	const names: string[] = [];
	for (const {name} of globalState.data) {
		if (!names.includes(name)) names.push(name);
	}
	names.sort((a, b) => a.localeCompare(b));

	const hueDelta = 360 / names.length;
	let hue = 0;
	names.forEach(name => {
		globalState.nameColor.set(name, `hsl(${hue}, 65%, 60%)`);
		hue += hueDelta;
	});

	const container1 = document.querySelector("#namesDropdown");
	const container = document.querySelector("#templateDiv");
	const template = container1.querySelector("template");
	container.innerHTML = "";
	container1.appendChild(template);
	document.querySelector("#namesDropdownSelectionX").classList.add("d-none");
	names.forEach((name, i) => {
		const templateClone = template.content.cloneNode(true) as DocumentFragment;
		templateClone.querySelector("li").id = `namesDropdownSelection${i+1}`;
		const button = templateClone.querySelector("a");
		const check = templateClone.querySelector("input");
		button.innerHTML = name;
		button.style.setProperty("--bubble-color", globalState.nameColor.get(name));
		check.id = `personCheck${name}`;
		//check.setAttribute("onClick", `updateSelectedNames(${name})`)

		container.appendChild(templateClone);
	});

	const checkboxes: NodeListOf<HTMLInputElement> = document.querySelectorAll('#namesDropdown input[type="checkbox"]');

    // Aggiungi un event listener a ogni checkbox x updatare la lista
    checkboxes.forEach((checkbox: HTMLInputElement) => {
        checkbox.addEventListener('change', () => {
			const checkboxId: string = checkbox.id;
            //console.log(`Checkbox with ID ${checkboxId} is ${checkbox.checked ? 'checked' : 'unchecked'}`);
			//console.log(checkboxId.split("personCheck").join(''));
			updateSelectedNames(checkboxId.split("personCheck").join(''), checkbox.checked);
        });
    });
}

function setTimeInterval(start: string, end: string) {
	console.log(start, end);
}
