import { totalGraph, avgGraph } from "./graphs";

export interface Poop {
	name: string;
	date: Date;
}

export interface GlobalState {
	selectedName: string | null
}

export const globalState: GlobalState = {
	selectedName: null
}

document.addEventListener("DOMContentLoaded", _ => {
	const input: HTMLInputElement = document.querySelector("#formFile");
	input.addEventListener("change", _ => parseFile(input.files[0]));

    const button: HTMLButtonElement = document.querySelector("#dropdownMenuButton");
	button.addEventListener("click", _ => {
		const dropdownItems: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('#namesDropdown .dropdown-item');
		const dropdownMenu = document.querySelector("#dropdownMenuButton");

		dropdownItems.forEach(item => {
			item.addEventListener('click', _ => {
				const selected = item.textContent.trim();
				if (selected === "General") {
					globalState.selectedName = null;
				} else {
					globalState.selectedName = selected;
				}
				dropdownMenu.innerHTML = selected;
			});
		});
	});
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

	const container = document.querySelector("#namesDropdown");
	const template = container.querySelector("template");
	document.getElementById("namesDropdownSelectionX").classList.add("d-none");
	names.forEach((name, i) => {
		const templateClone = template.content.cloneNode(true) as DocumentFragment;
		templateClone.querySelector("li").id = `namesDropdownSelection${i+1}`;
		templateClone.querySelector("a").innerHTML = name;

		container.appendChild(templateClone);
	});
}
