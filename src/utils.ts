// Color enum for console output
export enum ColorType {
	Reset = "\x1b[0m",
	Black = "\x1b[30m",
	Red = "\x1b[31m",
	Green = "\x1b[32m",
	Yellow = "\x1b[33m",
	Blue = "\x1b[34m",
	Magenta = "\x1b[35m",
	Cyan = "\x1b[36m",
	White = "\x1b[37m",
}


/**
 * Prints colored text to the console
 */
export function colorPrint(...messages: Array<string | [string, ColorType]>): void {
	let output = '';
	for (const message of messages) {
		if (typeof message == "string") {
			output += message
		} else {
			const [text, color] = message;
			output += `${color ?? ColorType.White}${text}${ColorType.Reset}`;
		}
	}
	console.log(output);
}
