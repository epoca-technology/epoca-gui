import { Component,  OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { environment } from '../../../../environments/environment';
import { 
    ApiService, 
    IAlarmsConfig, 
    IApiError, 
    ApiErrorService, 
    IServerData, 
    ServerService, 
    UtilsService, 
    DatabaseManagementService, 
    FileService, 
    IDatabaseSummary,
    IDatabaseSummaryTable,
    IDownloadedFile
} from '../../../core';
import { AppService, AudioService, ClipboardService, ILayout, NavService, SnackbarService } from '../../../services';
import { AlarmsConfigDialogComponent } from './alarms-config-dialog/alarms-config-dialog.component';
import { ApiErrorDialogComponent } from './api-error-dialog/api-error-dialog.component';
import { ISection, ISectionID, IServerComponent, IState, IStates, IServerIssues } from './interfaces';

@Component({
  selector: 'app-server',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.scss']
})
export class ServerComponent implements OnInit, OnDestroy, IServerComponent {
    // Server Sidenav Element
	@ViewChild('serverSidenav') serverSidenav: MatSidenav|undefined;
	public serverSidenavOpened: boolean = false;
	
	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // Server Data
    public serverData?: IServerData;

    // Nav
    public sections: ISection[] = [
        {id: 'monitoring', name: 'Monitoring', icon: 'leaderboard'},
        {id: 'api-errors', name: 'API errors', svgIcon: 'bug_report'},
        {id: 'database', name: 'Database', svgIcon: 'database'},
        {id: 'file-systems', name: 'File Systems', svgIcon: 'hdd'},
        {id: 'memory', name: 'Memory', icon: 'memory'},
        {id: 'cpu', name: 'Central Processing Unit', svgIcon: 'hardware_chip'},
        {id: 'gpu', name: 'Graphics Processing Unit', svgIcon: 'hardware_chip'},
        {id: 'os', name: 'Operating System', svgIcon: 'ubuntu'},
        {id: 'software-versions', name: 'Software Versions', svgIcon: 'code_branch'},
        {id: 'system', name: 'System', icon: 'personal_video'},
        {id: 'baseboard', name: 'Baseboard', icon: 'developer_board'},
        {id: 'bios', name: 'BIOS', icon: 'subtitles'},
        {id: 'network-interfaces', name: 'Network Interfaces', icon: 'router'}
    ];
    public activeSection = this.sections[0];

    // Server Issues
    public serverIssues: IServerIssues = {
        issues: false,
        environmentError: false,
        candlesticksSyncError: true,
        timeError: true,
        resourceUpdateError: true,
        hardwareError: true,
        resourcesCommunicationError: undefined,
        errorsCommunicationError: undefined
    }

    // Badge States
    public states: IStates = {
        cpuLoad: 'optimal',
        cpuMaxTemp: 'optimal',
        cpuMainTemp: 'optimal',
        cpuChipsetTemp: 'optimal',
        cpuCoresTemp: [],
        cpuSocketsTemp: [],
        memoryUsage: 'optimal',
        gpuLoad: 'optimal',
        gpuTemp: 'optimal',
        gpuMemoryTemp: 'optimal',
        fsUsage: []
    }

    // API Errors List
    public apiErrors: IApiError[] = [];
    public activeErrorIndex: number = 0;
    private errorSliderInterval: any;

    /* Database Related */
    // Summary
    public summary?: IDatabaseSummary;

    // Tables
    public tables: IDatabaseSummaryTable[] = [];
    public testTables: IDatabaseSummaryTable[] = [];
    public testTablesVisible: boolean = false;

    // Files
    public files: IDownloadedFile[] = [];
    public filesDownloaded: boolean = false;

    // Outage Audio
    private outageLastPlayed: number|undefined = undefined;

    // Submission
    public submitting: boolean = false;

    // Load State
    public loaded = false;

    constructor(
        private _app: AppService,
        private _server: ServerService,
        private _utils: UtilsService,
        private _snackbar: SnackbarService,
        public _nav: NavService,
        public _api: ApiService,
        private dialog: MatDialog,
        private _audio: AudioService,
        private _apiError: ApiErrorService,
        private _db: DatabaseManagementService,
        private _file: FileService,
        public _clipboard: ClipboardService
    ) { }


    async ngOnInit(): Promise<void> {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        // Retrieve the server data
        try { this.serverData = await this._server.getServerData() } catch (e) { this._snackbar.error(e)}

        // Retrieve the API Errors
        try { 
            // Retrieve all the errors
            this.apiErrors = await this._apiError.getAll();

            // Initialize the error slider interval
            this.errorSliderInterval = setInterval(() => {
                if (this.activeErrorIndex >= this.apiErrors.length - 1) {
                    this.activeErrorIndex = 0;
                } else {
                    this.activeErrorIndex += 1;
                }
            }, 5000); // Change every 5 seconds
        } catch (e) { this._snackbar.error(e)}

        // Set meta data
        this.onDataChanges();

        // Set the loading state
        this.loaded = true;
    }


    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
        if (this.errorSliderInterval) clearInterval(this.errorSliderInterval)
    }







    /* Navigation */



    /**
     * Activates a section by providing an ID.
     * @param id 
     * @returns void
     */
    public activateSectionByID(id: ISectionID): void {
        for (let s of this.sections) { if (s.id == id) this.activateSection(s) }
    }






    /**
     * Activates a given section. It will also download the section's data
     * if applies.
     * @param section 
     * @returns Promise<void>
     */
    public async activateSection(section: ISection): Promise<void> {
        // Hide the sidenavs if any
		if (this.serverSidenav && this.serverSidenavOpened) this.serverSidenav.close();

        // Set loading state
        this.loaded = false;

        // Set the new section
        this.activeSection = section;

        // Load the database if applies
        if (this.activeSection.id == 'database') await this.loadDatabaseData();

        // Allow a small delay
        await this._utils.asyncDelay(0.5);

        // Update loading state
        this.loaded = true;
    }
















    /* Server Data Management */







    /**
     * Refreshes the server resources data.
     * @returns Promise<void>
     */
     public async refreshServerResources(): Promise<void> {
        if (this.serverData) {
            try {
                this.serverData.resources = await this._server.getServerResources();
                this.serverIssues.resourcesCommunicationError = undefined;
            } catch (e) { 
                const err: string = this._utils.getErrorMessage(e);
                this._snackbar.error(err);
                this.serverIssues.resourcesCommunicationError = err;
            }
        } else {
            try { this.serverData = await this._server.getServerData() } catch (e) { this._snackbar.error(e)}
        }

        // Update meta data
        this.onDataChanges();
    }









    /**
     * Triggers whenever there is a data change and populates
     * all metadata.
     * @returns void
     */
    private onDataChanges(): void {
        if (this.serverData) {
            // Populate states
            this.populateStates();

            // Check if there is an environment error
            this.serverIssues.environmentError = environment.production !== this.serverData.production;

            // Check if there is a candlestick sync error
            this.serverIssues.candlesticksSyncError = !this.serverData.resources.candlesticksSynced;

            // Check if there is a time error
            const past: number = moment().subtract(3, "minutes").valueOf();
            const future: number = moment().add(3, "minutes").valueOf();
            this.serverIssues.timeError = 
                this.serverData.resources.serverTime < past || 
                this.serverData.resources.serverTime > future;

            // Check if there is a resource update error
            const tenMinutesAgo: number = moment().subtract(10, "minutes").valueOf();
            this.serverIssues.resourceUpdateError = this.serverData.resources.lastResourceScan < tenMinutesAgo;

            // Check if there is a hardware error
            this.serverIssues.hardwareError = this.currentErrorState();

            // Check if there is an issue
            this.serverIssues.issues = 
                this.serverIssues.environmentError ||
                this.serverIssues.candlesticksSyncError ||
                this.serverIssues.timeError ||
                this.serverIssues.resourceUpdateError ||
                this.serverIssues.hardwareError ||
                typeof this.serverIssues.resourcesCommunicationError == "string" ||
                typeof this.serverIssues.errorsCommunicationError == "string";

            // Play the outage if there has been an issue
            if (this.serverIssues.issues) this.playOutageAudio();
        }
    }






    /**
     * Populates the state colors for each of the monitoring elements.
     * @returns void
     */
    private populateStates(): void {
        // CPU States
        this.states.cpuLoad = this.getState(this.serverData!.resources.cpuLoad.currentLoad, this.serverData!.resources.alarms.max_cpu_load);
        this.states.cpuMaxTemp = this.getState(this.serverData!.resources.cpuTemperature.max, this.serverData!.resources.alarms.max_cpu_temperature);
        this.states.cpuMainTemp = this.getState(this.serverData!.resources.cpuTemperature.main, this.serverData!.resources.alarms.max_cpu_temperature);
        this.states.cpuChipsetTemp = this.getState(this.serverData!.resources.cpuTemperature.chipset, this.serverData!.resources.alarms.max_cpu_temperature);
        let cores: IState[] = [];
        for (let c of this.serverData!.resources.cpuTemperature.cores) { cores.push(this.getState(c, this.serverData!.resources.alarms.max_cpu_temperature)) }
        this.states.cpuCoresTemp = cores;
        let sockets: IState[] = [];
        for (let s of this.serverData!.resources.cpuTemperature.socket) { sockets.push(this.getState(s, this.serverData!.resources.alarms.max_cpu_temperature)) }
        this.states.cpuSocketsTemp = sockets;

        // Memory
        this.states.memoryUsage = this.getState(this.serverData!.resources.memory.usedPercent, this.serverData!.resources.alarms.max_memory_usage);
        
        // GPU
        this.states.gpuLoad = this.getState(this.serverData!.resources.gpu.utilizationGpu, this.serverData!.resources.alarms.max_gpu_load);
        this.states.gpuTemp = this.getState(this.serverData!.resources.gpu.temperatureGpu, this.serverData!.resources.alarms.max_gpu_temperature);
        this.states.gpuMemoryTemp = this.getState(this.serverData!.resources.gpu.temperatureMemory, this.serverData!.resources.alarms.max_gpu_memory_temperature);
    
        // File Systems
        let fs: IState[] = [];
        for (let f of this.serverData!.resources.fileSystems) { fs.push(this.getState(f.usedPercent, this.serverData!.resources.alarms.max_file_system_usage)) }
        this.states.fsUsage = fs;
    }







    /**
     * Calculates the difference between the current and max values,
     * returning the state class for the component
     * @param current 
     * @param max 
     * @returns IState
     */
    private getState(current: number, max: number): IState {
        // Calculate the difference
        const difference: number = max - current;

        // Handle each case accordingly
        if (difference <= 10) { return 'error' }
        else if (difference > 10 && difference <= 20) { return 'warning' }
        else if (difference > 20 && difference <= 30) { return 'average' }
        else if (difference > 30 && difference <= 40) { return 'normal' }
        else { return 'optimal' }
    }







    /**
     * Iterates over the entire state object and checks if there is a 
     * current error.
     * @returns boolean
     */
    private currentErrorState(): boolean {
        // Iterate over the entire object
        const values: any = Object.values(this.states);
        for (let value of values) {
            // Handle a string value
            if (typeof value == "string" && value == "error") {
                return true;
            }

            // Handle a list of strings
            else if (value instanceof Array) {
                for (let v of value) {
                    if (v == "error") {
                        return true;
                    }
                }
            }
        }

        // If no error state was found, return false
        return false;
    }













    /**
     * Displays the server alarms config dialog.
     * has been set.
     * @returns void
     */
     public updateConfig(): void {
         if (this.serverData) {
            this.dialog.open(AlarmsConfigDialogComponent, {
                disableClose: true,
                hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
                panelClass: 'small-dialog',
                data: this.serverData?.resources.alarms
            }).afterClosed().subscribe(
                async (newConfig: IAlarmsConfig|undefined) => {
                    if (newConfig) {
                        // Allow a small delay
                        await this._utils.asyncDelay(0.3);

                        // Prompt the confirmation dialog
                        this._nav.displayConfirmationDialog({
                            title: 'Update Alarms Configuration',
                            content: '<p class="align-center">Are you sure that you wish to change the current alarms configuration?</p>',
                            otpConfirmation: true
                        }).afterClosed().subscribe(
                            async (otp: string|undefined) => {
                                if (otp) {
                                    // Set Submission State
                                    this.submitting = true;
                                    try {
                                        // Set new config
                                        await this._server.setAlarmsConfiguration(newConfig, otp);
                
                                        // Update local value
                                        this.serverData!.resources.alarms = newConfig;

                                        // Notify
                                        this._snackbar.success('The alarms configuration has been updated succesfully.');
                                    } catch(e) { this._snackbar.error(e) }
                
                                    // Set Submission State
                                    this.submitting = false;
                                }
                            }
                        );
                    }
                }
            );
         } else {
             this._snackbar.error('The alarms config cannot be updated as the server data didnt load correctly.');
         }
    }













    /* API Errors */






    /**
     * Refreshes the API Errors.
     * @returns Promise<void>
     */
     public async refreshAPIErrors(): Promise<void> {
        try {
            this.apiErrors = await this._apiError.getAll();
            this.serverIssues.errorsCommunicationError = undefined;
        } catch (e) { 
            const err: string = this._utils.getErrorMessage(e);
            this._snackbar.error(err);
            this.serverIssues.errorsCommunicationError = err;
        }

        // Trigger the server check and handle errors if any
        this.onDataChanges();
    }







    /**
     * Prompts the confirmation dialog and if confirmed, it will delete all api errors.
     * @returns void
     */
     public deleteAll(): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: 'Delete API Errors',
            content: `
                <p class="align-center">
                    Are you sure that you wish to <strong>delete</strong> all API Errors from the database?
                </p>
            `,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set Submission State
                    this.submitting = true;
                    try {
                        // Register the IP and refresh the list
                        this.apiErrors = await this._apiError.deleteAll(otp);
                    } catch(e) { this._snackbar.error(e) }

                    // Set Submission State
                    this.submitting = false;
                }
            }
        );
    }





    /**
     * Displays an API Error Dialog.
     * @param error 
     * @returns void
     */
    public displayAPIErrorDialog(error: IApiError): void {
        this.dialog.open(ApiErrorDialogComponent, {
            disableClose: true,
            hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
            panelClass: 'medium-dialog',
            data: error
        })
    }












    /* Database */







    /**
     * Downloads the Database Data in case it hasn't been already. If so,
     * it resolves right away.
     * @returns Promise<void>
     */
    private async loadDatabaseData(): Promise<void> {
        // Retrieve the summary if it hasnt already
        if (!this.summary) {
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
        }


        // Retrieve the Backup Files if it hasnt already
        if (!this.files.length) await this.listBackupFiles();
    }










    /**
     * Downloads and populates all the backup files.
     * @returns Promise<void>
     */
    public async listBackupFiles(): Promise<void> {
        // Set Submission State
        this.filesDownloaded = false;

        // Download the files
        try {
            this.files = await this._file.listDatabaseBackups();
        } catch (e) { this._snackbar.error(e) }

        // Set Submission State
        this.filesDownloaded = true;
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
                        const url: string = await this._file.getDatabaseBackupDownloadURL(name);
                        this._nav.openUrl(url);
                    } catch(e) { this._snackbar.error(e) }

                    // Set Submission State
                    this.submitting = false;
                }
            }
        );
    }











    /* Misc Helpers */






    /**
     * Makes sure the outage audio is only played once per minute.
     * @returns void
     */
    private playOutageAudio(): void {
        // Init the current time
        const ts: number = Date.now();

        // Check if it has already been played
        if (typeof this.outageLastPlayed == "number") {
            // Make sure that it hasn't been played in the last minute
            const oneMinuteAgo: number = moment().subtract(1, "minute").valueOf();
            if (this.outageLastPlayed < oneMinuteAgo) {
                this._audio.playOutage();
                this.outageLastPlayed = ts;
            }
        } 

        // Otherwise, play it and record the time
        else {
            this._audio.playOutage();
            this.outageLastPlayed = ts;
        }
    }
}
