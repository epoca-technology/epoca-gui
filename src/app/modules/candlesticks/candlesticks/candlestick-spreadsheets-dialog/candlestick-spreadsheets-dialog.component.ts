import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import { FileService, IDownloadedFile } from '../../../../core';
import { ClipboardService, SnackbarService, NavService } from '../../../../services';
import {ICandlestickSpreadsheetsDialogComponent} from "./interfaces"

@Component({
  selector: 'app-candlestick-spreadsheets-dialog',
  templateUrl: './candlestick-spreadsheets-dialog.component.html',
  styleUrls: ['./candlestick-spreadsheets-dialog.component.scss']
})
export class CandlestickSpreadsheetsDialogComponent implements OnInit, ICandlestickSpreadsheetsDialogComponent {
	// Spreadsheet files
	public files: IDownloadedFile[] = [];

	// Submission
	public submitting: boolean = false;

	// Load state
	public loaded: boolean = false;

    constructor(
		private dialogRef: MatDialogRef<CandlestickSpreadsheetsDialogComponent>,
		private _file: FileService,
		private _clipboard: ClipboardService,
		private _snackbar: SnackbarService,
		private _nav: NavService
    ) { }

    ngOnInit(): void {
		this.downloadFiles();
    }







	/**
	 * Downloads all spreadsheets and set the local list.
	 * @returns Promise<void>
	 */
	public async downloadFiles(): Promise<void> {
		// Set loading state
		this.loaded = false;

		// Download files
		try {
			this.files = await this._file.listCandlestickSpreadsheets();
		} catch (e) { this._snackbar.error(e) }

		// Set loading state
		this.loaded = true;
	}






	/**
	 * Copies the download url of a given file into clipboard.
	 * @param fileName 
	 * @returns Promise<void>
	 */
	public async copyDownloadLink(fileName: string): Promise<void> {
		this.submitting = true;
		try {
			// Get the download url
			const url: string = await this._file.getCandlestickSpreadsheetDownloadURL(fileName);

			// Copy it on Clipboard
			this._clipboard.copy(url);
		} catch (e) { this._snackbar.error(e) }
		this.submitting = false;
	}








	/**
	 * Downloads a given file to the device.
	 * @param fileName 
	 * @returns Promise<void>
	 */
	 public async downloadFile(fileName: string): Promise<void> {
		this.submitting = true;
		try {
			// Get the download url
			const url: string = await this._file.getCandlestickSpreadsheetDownloadURL(fileName);

			// Open it on the browser for download
			this._nav.openUrl(url)
		} catch (e) { this._snackbar.error(e) }
		this.submitting = false;
	}







	
	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close(false) }
}
