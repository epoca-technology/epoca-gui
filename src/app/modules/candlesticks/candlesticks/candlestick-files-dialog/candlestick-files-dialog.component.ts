import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import { CandlestickService, FileService, IBackgroundTaskInfo, IDownloadedFile } from '../../../../core';
import { ClipboardService, SnackbarService, NavService } from '../../../../services';
import {ICandlestickFilesDialogComponent} from "./interfaces"



@Component({
  selector: 'app-candlestick-files-dialog',
  templateUrl: './candlestick-files-dialog.component.html',
  styleUrls: ['./candlestick-files-dialog.component.scss']
})
export class CandlestickFilesDialogComponent implements OnInit, ICandlestickFilesDialogComponent {
	// Prediction Candlestic Files
	public predictionCandlestickTask!: IBackgroundTaskInfo;
	public predictionCandlestickFiles: IDownloadedFile[] = [];

	// Candlestick Bundle Files
	public candlestickBundleTask!: IBackgroundTaskInfo;
	public candlestickBundleFiles: IDownloadedFile[] = [];

	// Submission
	public submitting: boolean = false;

	// Load state
	public loaded: boolean = false;

    constructor(
		private dialogRef: MatDialogRef<CandlestickFilesDialogComponent>,
		private _file: FileService,
		private _candlestick: CandlestickService,
		private _clipboard: ClipboardService,
		private _snackbar: SnackbarService,
		private _nav: NavService
    ) { }

    ngOnInit(): void {
		this.downloadFiles();
    }







	/**
	 * Downloads all the files as well as the tasks.
	 * @returns Promise<void>
	 */
	public async downloadFiles(): Promise<void> {
		// Set loading state
		this.loaded = false;

		// Download all the required data
		await Promise.all([
			this.populateTask(false),
			this.populateFiles(false),
			this.populateTask(true),
			this.populateFiles(true)
		]);

		// Set loading state
		this.loaded = true;
	}





	/**
	 * Populates the task info object based on the type of file.
	 * @param prediction 
	 * @returns Promise<void>
	 */
	public async populateTask(prediction: boolean): Promise<void> {
		try {
			let task: IBackgroundTaskInfo;
			if (prediction) {
				task = await this._candlestick.getPredictionFileTask();
				if (this.predictionCandlestickTask && this.predictionCandlestickTask.state != "completed" && task.state == "completed") {
					await this.populateFiles(true)
				}
				this.predictionCandlestickTask = task;
			} else {
				task = await this._candlestick.getBundleFileTask();
				if (this.candlestickBundleTask && this.candlestickBundleTask.state != "completed" && task.state == "completed") {
					await this.populateFiles(false)
				}
				this.candlestickBundleTask = task;
			}
		} catch (e) { this._snackbar.error(e) }
	}








	/**
	 * Populates the files based on the type of file.
	 * @param prediction 
	 * @returns Promise<void>
	 */
	public async populateFiles(prediction: boolean): Promise<void> {
		try {
			if (prediction) {
				this.predictionCandlestickFiles = await this._file.listPredictionCandlestickFiles();
			} else {
				this.candlestickBundleFiles = await this._file.listCandlestickBundleFiles();
			}
		} catch (e) { this._snackbar.error(e) }
	}










	/**
	 * Copies the download url of a given file into clipboard.
	 * @param fileName 
	 * @param prediction 
	 * @returns Promise<void>
	 */
	public async copyDownloadLink(fileName: string, prediction: boolean): Promise<void> {
		this.submitting = true;
		try {
			// Get the download url
			const url: string = await this.getDownloadUrl(fileName, prediction);

			// Copy it on Clipboard
			this._clipboard.copy(url);
		} catch (e) { this._snackbar.error(e) }
		this.submitting = false;
	}








	/**
	 * Downloads a given file to the device.
	 * @param fileName 
	 * @param prediction 
	 * @returns Promise<void>
	 */
	 public async downloadFile(fileName: string, prediction: boolean): Promise<void> {
		this.submitting = true;
		try {
			// Get the download url
			const url: string = await this.getDownloadUrl(fileName, prediction);

			// Open it on the browser for download
			this._nav.openUrl(url)
		} catch (e) { this._snackbar.error(e) }
		this.submitting = false;
	}






	/**
	 * Downloads the URL for a specific file based on its type.
	 * @param fileName 
	 * @param prediction 
	 * @returns Promise<string>
	 */
	private async getDownloadUrl(fileName: string, prediction: boolean): Promise<string> {
		// Get the download url
		let url: string;
		if (prediction) {
			url = await this._file.getPredictionCandlestickDownloadURL(fileName);
		} else {
			url = await this._file.getCandlestickBundleDownloadURL(fileName);
		}
		return url;
	}









	/**
	 * Prompts the confirmation dialog and generates a candlestick file.
	 * @param prediction 
	 * @returns void
	 */
	public generateFile(prediction: boolean): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: prediction ? 'Prediction Candlesticks File': 'Candlesticks Bundle File',
            content: `
                <p class="align-center">
                    Are you sure that you wish to <strong>generate</strong> the candlesticks file?
                </p>
            `,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set Submission State
                    this.submitting = true;
                    try {
						if (prediction) {
							this.predictionCandlestickTask = await this._candlestick.generatePredictionCandlesticksFile(otp);
						} else {
							this.candlestickBundleTask = await this._candlestick.generateCandlesticksBundleFile(otp);
						}
                    } catch(e) { this._snackbar.error(e) }

                    // Set Submission State
                    this.submitting = false;
                }
            }
        );
	}





	
	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close(false) }
}
