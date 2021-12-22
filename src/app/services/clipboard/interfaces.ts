export interface IClipboardService {
	// Checks if it is possible to read data from the clipboard
	canPaste: boolean,
	
	// Inserts data into the clipboard
	copy(content: string, notify: boolean): void,
	
	// Reads data from the clipboard for pasting purposes
	read(): Promise<string>
}



