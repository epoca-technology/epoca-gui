import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Subscription } from 'rxjs';
import { IIPBlacklistRecord, IpBlacklistService, } from '../../../core';
import { AppService, ILayout, NavService, ValidationsService } from '../../../services';
import { IIpBlacklistComponent, IView } from './interfaces';

@Component({
  selector: 'app-ip-blacklist',
  templateUrl: './ip-blacklist.component.html',
  styleUrls: ['./ip-blacklist.component.scss']
})
export class IpBlacklistComponent implements OnInit, OnDestroy, IIpBlacklistComponent {
    // Inputs
    @ViewChild("ipControl") ipControl? : ElementRef;
    @ViewChild("notesControl") notesControl? : ElementRef;

    // Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // IP List
    public list: IIPBlacklistRecord[] = [];
    
    // Active View
    public view: IView = 'intro';

    // Active Record
    public active: IIPBlacklistRecord|undefined;

    // Form
    public form: FormGroup = new FormGroup({
        ip: new FormControl('', [ this._validations.ipValid ]),
        notes: new FormControl('', [ this._validations.ipNotesValid ]),
    });

    // Submission State
    public submitting: boolean = false;

    // Load State
    public loaded = false;

    constructor(
        private _app: AppService,
        public _nav: NavService,
        private _blacklist: IpBlacklistService,
        private _validations: ValidationsService
    ) { }

    async ngOnInit(): Promise<void> {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        // Retrieve the users
        try {
            this.list = await this._blacklist.getAll();
        } catch (e) { this._app.error(e) }

        // Set the loading state
        this.loaded = true;
    }



    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
    }


    /* Form Getters */
	get ip(): AbstractControl { return <AbstractControl>this.form.get('ip') }
	get notes(): AbstractControl { return <AbstractControl>this.form.get('notes') }






    /* Navigation */

    


    // Nav Bottom Sheet
    public displayBottomSheet(record: IIPBlacklistRecord): void {
        // Abort if submitting
        if (this.submitting) return;

        // Display the bottom sheet and handle the action
		const bs: MatBottomSheetRef = this._nav.displayBottomSheetMenu([
            {icon: 'info', title: 'Record', description: 'View record details', response: 'recordDetails'},
            {icon: 'lock_open', title: 'Unregister', description: 'Remove the IP from the Blacklist', response: 'unregister'},
        ]);
		bs.afterDismissed().subscribe((response: string|undefined) => {
			switch (response) {
				case 'recordDetails':
					this.gotoForm(record);
					break;
				case 'unregister':
					this.unregisterIP(record.ip);
					break;
			}
		});
	}





    // Intro
    public gotoIntro(): void {
        setTimeout(() => {
            this.view = 'intro';
            this.form.reset();
            this.active = undefined;
        });
    }



    // Form
    public gotoForm(record?: IIPBlacklistRecord): void {
        // Set the active record
        this.active = record;

        // Check if the form needs to be populated
        if (record) {
            this.ip.setValue(record.ip);
            this.notes.setValue(record.n);
        }

        // Enable or disable the IP input
        if (record) { this.ip.disable() } else { this.ip.enable() }

        // Activate the view
        this.view = 'form';

        // Check if an input needs to be focused
        if (this.layout != "mobile") {
            setTimeout(() => { 
                if (!record && this.ipControl) { this.ipControl.nativeElement.focus() }
                else if (record && this.notesControl) { this.notesControl.nativeElement.focus() }
            });
        }
    }










    /* API Actions */





    /**
     * Submits the action based on the active record.
     * @returns void
     */
    public submit(): void {
        if (this.active) {
            this.submitUpdateNotes();
        } else {
            this.submitRegisterIP();
        }
    }




    /**
     * Prompts the confirmation dialog and if confirmed, it will blacklist an ip.
     * @returns void
     */
     private submitRegisterIP(): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: 'Blacklist IP',
            content: `
                <p class="align-center">
                    Are you sure that you wish to blacklist the IP <strong>${this.ip.value}</strong>?
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
                        this.list = await this._blacklist.registerIP(
                            this.ip.value, 
                            this.notes.value.length ? this.notes.value: undefined, 
                            otp
                        );

                        // Notify
                        this._app.success('The IP was blacklisted successfully.');

                        // Go to intro
                        this.submitting = false;
                        this.gotoIntro();
                    } catch(e) { this._app.error(e) }

                    // Set Submission State
                    this.submitting = false;
                }
            }
        );
    }





    /**
     * Prompts the confirmation dialog and if confirmed, it will update the record's notes.
     * @returns void
     */
     private submitUpdateNotes(): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: 'Update Notes',
            content: `
                <p class="align-center">
                    Are you sure that you wish to update the <strong>notes</strong> for the IP <strong>${this.ip.value}</strong>?
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
                        this.list = await this._blacklist.updateNotes(
                            this.ip.value, 
                            this.notes.value, 
                            otp
                        );

                        // Notify
                        this._app.success('The notes were updated successfully.');

                        // Go to intro
                        this.submitting = false;
                        this.gotoIntro();
                    } catch(e) { this._app.error(e) }

                    // Set Submission State
                    this.submitting = false;
                }
            }
        );
    }





    /**
     * Prompts the confirmation dialog and if confirmed, it will unregister an IP from the blacklist.
     * @returns void
     */
     public unregisterIP(ip: string): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: 'Unregister IP',
            content: `
                <p class="align-center">
                    Are you sure that you wish to <strong>unregister</strong> the IP <strong>${ip}</strong>?
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
                        this.list = await this._blacklist.unregisterIP(ip, otp);

                        // Notify
                        this._app.success('The IP was unregistered successfully.');

                        // Go to intro
                        this.submitting = false;
                        this.gotoIntro();
                    } catch(e) { this._app.error(e) }

                    // Set Submission State
                    this.submitting = false;
                }
            }
        );
    }
}
