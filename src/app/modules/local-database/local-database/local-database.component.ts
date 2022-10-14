import { Component, OnInit } from "@angular/core";
import { ILocalTableInfo, LocalDatabaseService, UtilsService } from "../../..//core";
import { AppService, NavService } from "../../../services";
import { ILocalDatabaseComponent } from "./interfaces";

@Component({
  selector: "app-local-database",
  templateUrl: "./local-database.component.html",
  styleUrls: ["./local-database.component.scss"]
})
export class LocalDatabaseComponent implements OnInit, ILocalDatabaseComponent {

	// Database Tables
	public tables: ILocalTableInfo[] = [];

	// Load State
	public loaded = false;



	constructor(
		public _nav: NavService,
		private _app: AppService,
		private _utils: UtilsService,
		public _localDB: LocalDatabaseService
	) { }




	async ngOnInit(): Promise<void> {
		// Allow a small delay to guarantee the db initializes
		await this._utils.asyncDelay(1);

		// Load the Tables
		try {this.tables = await this._localDB.getTablesInfo() } catch (e) { this._app.error(e) };

		// Update the loading state
		this.loaded = true;
	}





	/**
	 * Displays a confirmation prompt and if approved, it 
	 * deletes the entire db and re-initializes it.
	 */
	public deleteDB(): void {
        this._nav.displayConfirmationDialog({
            title: "Delete Database",
            content: "<p class='align-center'>If you confirm the action, the entire Indexed Database will be deleted and re-initialized.</p>"
        }).afterClosed().subscribe(
            async (confirmed: boolean) => {
                if (confirmed) {
                    try { 
						this.loaded = false;
						// Delete the db
						await this._localDB.delete();

						// Re-initialize it
						await this._localDB.initialize();
						this.loaded = true;
						this._app.success("The Indexed Database has been deleted and re-initialized successfully.");
					} catch (e) { this._app.error(e) }
                }
            }
        );
	}
}
