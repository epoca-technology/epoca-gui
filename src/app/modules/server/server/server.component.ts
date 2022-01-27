import { Component,  OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { IAlarmsConfig, IServerData, ServerService, UtilsService } from '../../../core';
import { AppService, AudioService, ILayout, NavService, SnackbarService } from '../../../services';
import { AlarmsConfigDialogComponent } from './alarms-config-dialog/alarms-config-dialog.component';
import { ISection, IServerComponent } from './interfaces';

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
        {id: 'file-systems', name: 'File Systems', svgIcon: 'hdd'},
        {id: 'memory', name: 'Memory', icon: 'memory'},
        {id: 'cpu', name: 'Central Processing Unit', svgIcon: 'hardware_chip'},
        {id: 'gpu', name: 'Graphics Processing Unit', svgIcon: 'hardware_chip'},
        {id: 'os', name: 'Operating System', svgIcon: 'ubuntu'},
        {id: 'software-versions', name: 'Software Versions', svgIcon: 'code_branch'},
        {id: 'running-services', name: 'Running Services', icon: 'toggle_on'},
        {id: 'system', name: 'System', icon: 'personal_video'},
        {id: 'baseboard', name: 'Baseboard', icon: 'developer_board'},
        {id: 'bios', name: 'BIOS', icon: 'subtitles'},
        {id: 'network-interfaces', name: 'Network Interfaces', icon: 'router'}
    ];
    public activeSection = this.sections[0];

    // Refresh Error
    public refreshError: string|undefined = undefined;

    // Submission
    public submitting: boolean = false;

    // Load State
    public loaded = false;

    constructor(
        private _app: AppService,
        private _server: ServerService,
        private _utils: UtilsService,
        private _snackbar: SnackbarService,
        private _nav: NavService,
        private _audio: AudioService,
        private dialog: MatDialog,
    ) { }

    async ngOnInit(): Promise<void> {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        // Retrieve the server data
        try {
            this.serverData = await this._server.getServerData();
        } catch (e) { this._snackbar.error(e)}

        // Set meta data
        this.onDataChanges();

        // Set the loading state
        this.loaded = true;
    }

    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
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

        // Allow a small delay
        await this._utils.asyncDelay(0.5);

        // Update loading state
        this.loaded = true;
    }




    


    /**
     * Refreshes the server resources data.
     * @returns Promise<void>
     */
    public async refresh(): Promise<void> {
        if (this.serverData) {
            try {
                this.serverData.resources = await this._server.getServerResources();
                this.refreshError = undefined;
            } catch (e) { 
                const err: string = this._utils.getErrorMessage(e);
                this._snackbar.error(err);
                this.refreshError = err;
                this._audio.playOutage();
            }

            // Update meta data
            this.onDataChanges();
        } else {
            this._snackbar.error('Cannot perform a refresh because the server data was not initialized correctly.');
        }
    }







    /**
     * Triggers whenever there is a data change and populates
     * all metadata.
     * @returns void
     */
    private onDataChanges(): void {
        if (this.serverData) {
            // Order the running processes by cpu usage
            this.serverData.resources.runningServices.sort((a, b) => a['cpu'] > b['cpu'] ? -1 : a['cpu'] === b['cpu'] ? 0 : 1);
        }
    }







    /**
     * Displays the config dialog and reloads the chart once the new configuration
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
                                        await this._server.setAlarmsConfiguration(newConfig, '123456');
                
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
}
