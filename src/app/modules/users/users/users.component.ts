import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Subscription } from 'rxjs';
import { IBottomSheetMenuItem } from '../../../shared/components/bottom-sheet-menu';
import { IUser, UserService } from '../../../core';
import { AppService, ILayout, NavService, ValidationsService } from '../../../services';
import { IUsersComponent, IView } from './interfaces';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy, IUsersComponent {
    // Inputs
    @ViewChild("emailControl") emailControl? : ElementRef;
    @ViewChild("newEmailControl") newEmailControl? : ElementRef;
    @ViewChild("newAuthorityControl") newAuthorityControl? : ElementRef;

    // Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // User List
    public users: IUser[] = [];
    
    // Active View
    public view: IView = 'intro';

    // Active User
    public activeUser: IUser|undefined;

    // Create User Form
    public createForm: FormGroup = new FormGroup({
        email: new FormControl('', [ this._validations.emailValid ]),
        authority: new FormControl('', [ this._validations.authorityValid ]),
    });

    // Update Email Form
    public updateEmailForm: FormGroup = new FormGroup({
        newEmail: new FormControl('', [ this._validations.emailValid ])
    });

    // Update Authority Form
    public updateAuthorityForm: FormGroup = new FormGroup({
        newAuthority: new FormControl('', [ this._validations.authorityValid ])
    });

    // Submission State
    public submitting: boolean = false;

    // Load State
    public loaded = false;

    constructor(
        public _app: AppService,
        public _nav: NavService,
        private _user: UserService,
        private _validations: ValidationsService
    ) { }

    async ngOnInit(): Promise<void> {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        // Retrieve the users
        try {
            this.users = await this._user.getAll();
        } catch (e) { this._app.error(e) }

        // Set the loading state
        this.loaded = true;
    }



    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
    }


    /* Create Form Getters */
	get email(): AbstractControl { return <AbstractControl>this.createForm.get('email') }
	get authority(): AbstractControl { return <AbstractControl>this.createForm.get('authority') }


    /* Update Email Form Getters */
	get newEmail(): AbstractControl { return <AbstractControl>this.updateEmailForm.get('newEmail') }


    /* Update Authority Form Getters */
	get newAuthority(): AbstractControl { return <AbstractControl>this.updateAuthorityForm.get('newAuthority') }





    /* Navigation */




    // Nav Bottom Sheet
    public displayBottomSheet(user: IUser): void {
        // Abort if submitting
        if (this.submitting) return;

        // Build the items based on the authority
        let items: IBottomSheetMenuItem[] = [
            {icon: 'person', title: 'Details', description: 'View user details', response: 'user'},
        ];

        // Concatenate the rest if the user is not god
        if (user.authority != 5) {
            items = items.concat([
                {icon: 'email', title: 'Email', description: 'Update the user email', response: 'updateEmail'},
                {icon: 'logo_google', title: 'OTP Secret', description: 'Update the user OTP Secret', response: 'updateOTPSecret', svg: true},
                {icon: 'supervisor_account', title: 'Authority', description: 'Update the user authority', response: 'updateAuthority'},
                {icon: 'person_remove', title: 'Delete', description: 'Delete the user from Plutus', response: 'deleteUser'},
            ]);
        }

        // Display the bottom sheet and handle the action
		const bs: MatBottomSheetRef = this._nav.displayBottomSheetMenu(items);
		bs.afterDismissed().subscribe((response: string|undefined) => {
			switch (response) {
				case 'user':
					this.gotoUser(user);
					break;
				case 'updateEmail':
					this.gotoUpdateEmail(user);
					break;
                case 'updateOTPSecret':
                    this.updateOTPSecret(user);
                    break;
                case 'updateAuthority':
                    this.gotoUpdateAuthority(user);
                    break;
                case 'deleteUser':
                    this.deleteUser(user);
                    break;
			}
		});
	}




    // Intro
    public gotoIntro(): void {
        setTimeout(() => {
            this.view = 'intro';
            this.resetForms();
            this.activeUser = undefined;
        });
    }



    // User
    public gotoUser(user: IUser): void {
        this.activeUser = user;
        this.view = 'user';
    }



    // Create User
    public gotoCreateUser(): void {
        this.view = 'createUser';
        if (this.layout != "mobile") {
            setTimeout(() => { if (this.emailControl) this.emailControl.nativeElement.focus() });
        }
    }



    // Update Email
    public gotoUpdateEmail(user: IUser): void {
        this.activeUser = user;
        this.view = 'updateEmail';
        if (this.layout != "mobile") {
            setTimeout(() => { if (this.newEmailControl) this.newEmailControl.nativeElement.focus() });
        }
    }



    // Update Authority
    public gotoUpdateAuthority(user: IUser): void {
        this.activeUser = user;
        this.view = 'updateAuthority';
        if (this.layout != "mobile") {
            setTimeout(() => { if (this.newAuthorityControl) this.newAuthorityControl.nativeElement.focus() });
        }
    }


    // Form Reset
    private resetForms(): void {
        this.createForm.reset();
        this.updateEmailForm.reset();
        this.updateAuthorityForm.reset();
    }






    /* API Actions */




    /**
     * Prompts the confirmation dialog and if confirmed, it will create a new user.
     * @returns void
     */
     public submitCreateUser(): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: 'Create User',
            content: `
                <p class="align-center">
                    Are you sure that you wish to create the user <strong>${this.email.value}</strong> with an 
                    authority of <strong>${this.authority.value}</strong>?
                </p>
            `,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set Submission State
                    this.submitting = true;
                    try {
                        // Create the user and refresh the list of users
                        this.users = await this._user.createUser(this.email.value, this.authority.value, otp);

                        // Notify
                        this._app.success('The user was created successfully.');

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
     * Prompts the confirmation dialog and if confirmed, it will update the user's email.
     * @returns void
     */
     public submitUpdateEmail(): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: 'Update Email',
            content: `
                <p class="align-center">
                    Are you sure that you wish to update the email <strong>${this.activeUser!.email}</strong> to 
                    <strong>${this.newEmail.value}</strong>?
                </p>
            `,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set Submission State
                    this.submitting = true;
                    try {
                        // Update the email and refresh the list of users
                        this.users = await this._user.updateEmail(this.activeUser!.uid, this.newEmail.value, otp);

                        // Notify
                        this._app.success('The email was updated successfully.');

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
     * Prompts the confirmation dialog and if confirmed, it will update the OTP secret.
     * @returns void
     */
     public updateOTPSecret(user: IUser): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: 'Update OTP Secret',
            content: `
                <p class="align-center">
                    Are you sure that you wish to update the OTP Secret for <strong>${user.email}</strong>?
                </p>
            `,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set Submission State
                    this.submitting = true;
                    try {
                        // Update the OTP Secret and refresh the list of users
                        this.users = await this._user.updateOTPSecret(user.uid, otp);

                        // Notify
                        this._app.success('The OTP Secret was updated successfully.');
                    } catch(e) { this._app.error(e) }

                    // Set Submission State
                    this.submitting = false;
                }
            }
        );
    }





    /**
     * Prompts the confirmation dialog and if confirmed, it will update the user's authority.
     * @returns void
     */
     public submitUpdateAuthority(): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: 'Update Authority',
            content: `
                <p class="align-center">
                    Are you sure that you wish to update the authority for <strong>${this.activeUser!.email}</strong> 
                    from <strong>${this.activeUser!.authority}</strong> to <strong>${this.newAuthority.value}</strong>?
                </p>
            `,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set Submission State
                    this.submitting = true;
                    try {
                        // Update the authority and refresh the list of users
                        this.users = await this._user.updateAuthority(this.activeUser!.uid, this.newAuthority.value, otp);

                        // Notify
                        this._app.success('The authority was updated successfully.');

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
     * Prompts the confirmation dialog and if confirmed, it will update the OTP secret.
     * @returns void
     */
     public deleteUser(user: IUser): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: 'Delete User',
            content: `
                <p class="align-center">
                    Are you sure that you wish to delete the user <strong>${user.email}</strong>?
                </p>
            `,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set Submission State
                    this.submitting = true;
                    try {
                        // Update the OTP Secret and refresh the list of users
                        this.users = await this._user.deleteUser(user.uid, otp);

                        // Notify
                        this._app.success('The user was deleted successfully.');
                    } catch(e) { this._app.error(e) }

                    // Set Submission State
                    this.submitting = false;
                }
            }
        );
    }
}
