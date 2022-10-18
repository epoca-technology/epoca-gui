import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import { AppService, NavService } from '../../../../services';
import { 
	EpochService, 
	IBackgroundTaskInfo,
} from '../../../../core';
import { IUninstallEpochComponent } from "./interfaces";

@Component({
  selector: "app-uninstall-epoch",
  templateUrl: "./uninstall-epoch.component.html",
  styleUrls: ["./uninstall-epoch.component.scss"]
})
export class UninstallEpochComponent implements OnInit, IUninstallEpochComponent {
    // Epoch
    public epochID?: string;

	// Uninstall State
	public uninstalling: boolean = false;
	public task!: IBackgroundTaskInfo;

	
	constructor(
        private dialogRef: MatDialogRef<UninstallEpochComponent>,
		private _app: AppService,
		private _nav: NavService,
		private _epoch: EpochService
	) { }



	ngOnInit(): void {
        // Initialize the Epoch's ID
        const epochID: string|undefined = this._app.epoch.value ? this._app.epoch.value.record.id: undefined;
        if (!epochID) {
            this._app.error("An Epoch that is not active cannot be uninstalled.");
            this.close();
        } else {
            this.epochID = epochID;
        }
	}






    /**
     * Uninstalls the current epoch after a confirmation prompt. Once the
     * process is complete, it refreshes the app bulk and closes the dialog.
     */
	 public uninstall(): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: "Uninstall Epoch",
            content: `
                <p class="align-center">
                    Are you sure that you wish to uninstall <strong>${this.epochID}</strong> from Epoca?
                </p>
                <p class="align-center light-text ts-m">
                    Keep in mind that once an Epoch is uninstalled, it will be archived and won't be 
                    possible to reinstall it.
                </p>
            `,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set State
                    this.uninstalling = true;

                    // Initialize the installation task. If an error is invoked, delete the epoch file from the cloud
                    try { 
                        this.task = await this._epoch.uninstall(otp);
                    } catch(e) { 
                        this._app.error(e);
                        this.uninstalling = false;
                    }
                }
            }
        );
    }








	/**
	 * Retrieves the installation task from the API and performs a check
	 * on the state.
	 * @returns Promise<void>
	 */
     public async refreshTaskState(): Promise<void> {
		try {
			// Retrieve the current state of the task
			const task: IBackgroundTaskInfo = await this._epoch.getUninstallTask();

			// Check if the installation completed
			if (task.state == "completed") {
				await this._app.refreshAppBulk();
				this._app.success(`The epoch has been uninstalled successfully.`);
				this.close();
			}

			// Otherwise, just update the task's state
			else { this.task = task }
		} catch (e) { this._app.error(e) }
    }







	/*
	* Closes the dialog and
	* returns false.
	* @returns void
	* */
	public close(): void { this.dialogRef.close(false) }
}
