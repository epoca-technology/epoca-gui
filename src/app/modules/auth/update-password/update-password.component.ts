import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { RecaptchaComponent } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { UserService } from '../../../core';
import { AppService, ILayout, NavService, SnackbarService, ValidationsService } from '../../../services';
import { IUpdatePasswordComponent } from './interfaces';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss']
})
export class UpdatePasswordComponent implements OnInit, OnDestroy, IUpdatePasswordComponent {
    // Input
    @ViewChild("emailControl") emailControl? : ElementRef;

	// reCAPTCHA element
	@ViewChild('recaptchaEl') recaptchaEl?: RecaptchaComponent;

    // Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // Form
    public form: FormGroup = new FormGroup({
        email: new FormControl('', [ this._validations.emailValid ]),
        newPassword: new FormControl('', [ this._validations.passwordValid ]),
        newPasswordConfirm: new FormControl('', [ this._validations.passwordValid, this.passwordConfirmValid() ]),
        recaptcha: new FormControl('', [ Validators.required ]),
    });
    public passwordVisible: boolean = false;

    // Submission State
    public submitting: boolean = false;

    constructor(
        private _app: AppService,
        private _snackbar: SnackbarService,
        public _nav: NavService,
        private _user: UserService,
        private _validations: ValidationsService
    ) { }

    ngOnInit(): void {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        // Focus input if applies
        if (this.layout != "mobile") setTimeout(() => { if (this.emailControl) this.emailControl.nativeElement.focus() });
    }


    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
    }





    /* Form Getters */
	get email(): AbstractControl { return <AbstractControl>this.form.get('email') }
	get newPassword(): AbstractControl { return <AbstractControl>this.form.get('newPassword') }
	get newPasswordConfirm(): AbstractControl { return <AbstractControl>this.form.get('newPasswordConfirm') }
	get recaptcha(): AbstractControl { return <AbstractControl>this.form.get('recaptcha') }







    /**
     * Submits the form, retrieves the sign in token and attempts to sign in.
     * If successful, the user is redirected to the Dashboard.
     * @returns void
     */
    public submit(): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: 'Update Password',
            content: `<p class="align-center">Are you sure that you wish to update your password?</p>`,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set Submission State
                    this.submitting = true;
                    try {
                        // Update the password
                        await this._user.updatePassword(
                            this.email.value,
                            this.newPassword.value,
                            otp,
                            this.recaptcha.value
                        );

                        // Redirect the user to the sign in page
                        this._snackbar.success('Your password has been updated successfully.');
                        this._nav.signIn();
                    } catch(e) { 
                        // Display the error
                        this._snackbar.error(e);

                        // Reset the reCAPTCHA
                        this.recaptchaEl?.reset();
                    }

                    // Set Submission State
                    this.submitting = false;
                }
            }
        );
    }











    /**
     * Triggers if the recaptcha element throws any kind of error.
     * @param e 
     * @returns void
     */
    public onReCAPTCHAError(e: any): void { this._snackbar.error(e) }









	/*
	* Makes sure the the passwords match
	* @returns (() => {notEqual: boolean}|null)
	* */
	private passwordConfirmValid(): (() => {notEqual: boolean}|null) {
		return (): {notEqual: boolean}|null => {
			try {
				if (
					this.newPassword.value &&
					this.newPasswordConfirm.value &&
					this.newPassword.value == this.newPasswordConfirm.value
				) {
					return null;
				} else {
					return {notEqual: true};
				}
			} catch (e) {
				return {notEqual: true};
			}
		};
	}
}
