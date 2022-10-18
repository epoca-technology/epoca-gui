import { Component, OnInit } from "@angular/core";
import { EpochService } from "../../../../core";
import { AppService, NavService } from "../../../../services";
import { IUninstallEpochComponent } from "./interfaces";

@Component({
  selector: "app-uninstall-epoch",
  templateUrl: "./uninstall-epoch.component.html",
  styleUrls: ["./uninstall-epoch.component.scss"]
})
export class UninstallEpochComponent implements OnInit, IUninstallEpochComponent {


	// Submission
	public submitting: boolean = false;

	
	constructor(
		private _app: AppService,
		private _nav: NavService,
		private _epoch: EpochService
	) { }



	ngOnInit(): void {
	}






    /**
     * Uninstalls the current epoch after a confirmation prompt. Once the
     * process is complete, it refreshes the app bulk and closes the dialog.
     */
	 public uninstall(): void {
        // Initialize the Epoch's ID
        const epochID: string|undefined = this._app.epoch.value ? this._app.epoch.value.record.id: undefined;
        if (!epochID) {
            this._app.error("An Epoch that is not active cannot be uninstalled.");
            return;
        }

        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: "Uninstall Epoch",
            content: `
                <p class="align-center">
                    Are you sure that you wish to uninstall <strong>${epochID}</strong> from Epoca?
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
                    // Set Submission State
                    this.submitting = true;

                    try { 
                        // Uninstall the Epoch
                        await this._epoch.uninstall(otp);

                        // Refresh the App Bulk
                        await this._app.refreshAppBulk();
                    } catch(e) { this._app.error(e) }

                    // Set Submission State
                    this.submitting = false;
                }
            }
        );
    }
}
