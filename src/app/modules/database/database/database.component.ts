import { Component, OnInit } from '@angular/core';
import { ApiService, DatabaseManagementService, FileService, IDatabaseSummary, IDatabaseSummaryTable } from '../../../core';
import { ClipboardService, NavService, SnackbarService } from '../../../services';
import { IDatabaseComponent, IBackupFile } from './interfaces';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.scss']
})
export class DatabaseComponent implements OnInit, IDatabaseComponent {
    // Summary
    public summary?: IDatabaseSummary;

    // Tables
    public tables: IDatabaseSummaryTable[] = [];
    public testTables: IDatabaseSummaryTable[] = [];
    public testTablesVisible: boolean = false;

    // Files
    public files: IBackupFile[] = [];

    // Submission State
    public submitting = false;

    // Load State
    public loaded = false;

    constructor(
        public _api: ApiService,
        public _nav: NavService,
        private _db: DatabaseManagementService,
        private _file: FileService,
        private _snackbar: SnackbarService,
        public _clipboard: ClipboardService
    ) { }

    async ngOnInit(): Promise<void> {
        // Retrieve the Summary
        try {
            // Init the Summary
            this.summary = await this._db.getDatabaseSummary();

            // Separate real and test tables
            for (let t of this.summary.tables) {
                // Check if it is a test table
                if (t.name.includes('test')) { this.testTables.push(t) }

                // Otherwise, add it to the real table list
                else { this.tables.push(t) }
            }

            // Sort both lists
            this.tables.sort((a, b) => (a.name > b.name) ? 1 : -1);
            this.testTables.sort((a, b) => (a.name > b.name) ? 1 : -1);
        } catch (e) { this._snackbar.error(e) }

        // Retrieve the Backup Files
        await this.listBackupFiles();

        // Set load state
        this.loaded = true;
    }










    /**
     * Downloads and populates all the backup files.
     * @returns Promise<void>
     */
    public async listBackupFiles(): Promise<void> {
        // Set Submission State
        this.submitting = true;

        try {
            // Retrieve all the files
            let files: string[] = await this._file.listDatabaseBackups();

            // Reset the current files
            this.files = [];

            // Build the Files Object
            files.forEach((f: string) => {
                this.files.push({
                    name: f,
                    creation: Number(f.split('.')[0])
                });
            });

            // Sort them in descending order
            this.files.sort((a, b) => (b.creation > a.creation) ? 1 : -1);
        } catch (e) { this._snackbar.error(e) }

        // Set Submission State
        this.submitting = false;
    }





    /**
     * Downloads a backup file after prompting the confirmation dialog.
     * @param name 
     * @returns void
     */
    public downloadBackup(name: string): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: 'Download Backup',
            content: `
                <p class="align-center">
                    Are you sure that you wish to download the backup <strong>${name}</strong>?
                </p>
                <p class="align-center light-text ts-m">
                    Once downloaded, make sure to place it in an encrypted container as it may contain sensitive information.
                </p>
            `
        }).afterClosed().subscribe(
            async (confirmation: boolean|undefined) => {
                if (confirmation) {
                    // Set Submission State
                    this.submitting = true;
                    try {
                        // Retrieve the url and open it in a new tab
                        const url: string = await this._file.downloadDatabaseBackup(name);
                        this._nav.openUrl(url);
                    } catch(e) { this._snackbar.error(e) }

                    // Set Submission State
                    this.submitting = false;
                }
            }
        );
    }
}
