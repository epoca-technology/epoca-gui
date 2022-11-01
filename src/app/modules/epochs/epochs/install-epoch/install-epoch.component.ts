import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {MatDialogRef} from "@angular/material/dialog";
import { AppService, NavService, ValidationsService } from '../../../../services';
import { 
	EpochService, 
	FileService, 
	IBackgroundTaskInfo, 
	IFileInput, 
	IUploadedFile 
} from '../../../../core';
import { IInstallEpochComponent } from "./interfaces";

@Component({
  selector: "app-install-epoch",
  templateUrl: "./install-epoch.component.html",
  styleUrls: ["./install-epoch.component.scss"]
})
export class InstallEpochComponent implements OnInit, IInstallEpochComponent {
	// Form
	public form = new FormGroup ({ epochFile: new FormControl("",[]) });
	public epochFileInput = this.getEpochFile(undefined, false);
	public epochID?: string;

	// Install State
	public installing: boolean = false;
	public uploadProgress: number = 0;

	// Install Task
	public task!: IBackgroundTaskInfo;

	constructor(
		private dialogRef: MatDialogRef<InstallEpochComponent>,
		private _file: FileService,
		private _app: AppService,
		private _epoch: EpochService,
		private _validations: ValidationsService,
		private _nav: NavService
	) { }



	ngOnInit(): void {
	}




		
	/* Form Getters */
	get epochFile(): AbstractControl { return <AbstractControl>this.form.get("epochFile")}







	/* Epoch File Management */






	/**
	 * This function is invoked whenever the file input element
	 * changes. 
	 * It extracts the file data from the event and if everything
	 * is correct, it will proceed to uploading the file.
	 * Finally, it initializes the epoch installation task.
	 * @param event 
	 * @returns Promise<void>
	 */
	public async fileChanged(event: any): Promise<void> {
		try {
			// Retrieve the file
			this.epochFileInput = this.getEpochFile(event, true);

			// Make sure the file is valid
			if (typeof this.epochFileInput.error == "string") throw new Error(this.epochFileInput.error);

			// Extract the epoch id from the file
			this.epochID = this._file.getFileNameFromPath(this.epochFileInput.file!.name, true);
			if (!this._validations.epochIDValid(this.epochID)) {
				throw new Error(`The Epoch ID extracted from the file is invalid: ${this.epochID}`);
			}

			// Upload the Epoch File
			const uploadedFile: IUploadedFile = await this.uploadFile();

			// Prompt the confirmation dialog
			this._nav.displayConfirmationDialog({
				title: "Install Epoch",
				content: `
					<p class="align-center">
						Are you sure that you wish to install <strong>${this.epochID}</strong> in Epoca?
					</p>
				`,
				otpConfirmation: true
			}).afterClosed().subscribe(
				async (otp: string|undefined) => {
					// If the OTP was provided, begin the installation.
					if (otp) {
						// Set Installing State
						this.installing = true;
	
						// Initialize the installation task. If an error is invoked, delete the epoch file from the cloud
						try { 
							this.task = await this._epoch.install(<string>this.epochID, otp);
						} catch(e) { 
							this._app.error(e);
							await this._file.deleteEpochFile(<string>this.epochID);
							this.resetForm();
							this.installing = false;
						}
					} 
					
					// If the OTP was not provided, the process is reset
					else {
						await this._file.deleteEpochFile(<string>this.epochID);
						this._app.info("The Epoch Installation Process was aborted.");
						this.resetForm();
					}
				}
			);
		} catch (e) {
			this._app.error(e);
			this.resetForm();
		}
	}






	
	/*
	* Uploads the file into Epoca's Bucket. The uploader is wrapped
	* in a promise and updates the progress state.
	* @returns Promise<IUploadedFile>
	* */
	private uploadFile(): Promise<IUploadedFile> {
		return new Promise((resolve, reject) => {
			this._file.uploadEpochFile(<File>this.epochFileInput.file, <string>this.epochID).subscribe({
				next: (progressOrFile: number|IUploadedFile) => {
					if (typeof progressOrFile == "object") {
						resolve(progressOrFile);
					} else {
						this.uploadProgress = progressOrFile;
					}
				},
				error: error => reject(error)
			});
		});
	}






	/**
	 * Retrieves the installation task from the API and performs a check
	 * on the state.
	 * @returns Promise<void>
	 */
	public async refreshTaskState(): Promise<void> {
		try {
			// Retrieve the current state of the task
			const task: IBackgroundTaskInfo = await this._epoch.getInstallTask();

			// Check if the installation completed
			if (task.state == "completed") {
				setTimeout(async () => {
					await this._app.refreshAppBulk();
					this._app.success(`The epoch ${this.epochID} has been installed successfully.`);
					setTimeout(() => { this.close(true) }, 500);
				}, 1000);
			}

			// Otherwise, just update the task's state
			else { this.task = task }
		} catch (e) { this._app.error(e) }
	}







	/**
	 * Resets the form to its default state.
	 */
	private resetForm(): void {
		this.epochFileInput = this.getEpochFile(undefined, false);
		this.epochFile.setValue(null);
		this.uploadProgress = 0;
	}











	



	/* Misc Helpers */






	/**
	 * Wraps the file input retriever in order to simplify its
	 * management.
	 * @param event 
	 * @param touched 
	 * @returns IFileInput
	 */
	private getEpochFile(event?: any, touched?: boolean): IFileInput {
		return this._file.getFile(
			event, 
			["application/zip"], 
			390 * 1024 * 1024,
			touched
		);
	}





	


	/*
	* Closes the dialog and
	* returns false.
	* @returns void
	* */
	public close(actionCompleted?: boolean): void { this.dialogRef.close(actionCompleted == true) }
}
