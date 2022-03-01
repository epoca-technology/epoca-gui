import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { RecaptchaComponent } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { AuthService, ISignInToken, UserService, UtilsService } from '../../../core';
import { AppService, ILayout, NavService, SnackbarService, ValidationsService } from '../../../services';
import { ISignInComponent } from './interfaces';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit, OnDestroy, ISignInComponent {
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
        password: new FormControl('', [ this._validations.passwordValid ]),
        recaptcha: new FormControl('', [ Validators.required ]),
    });
    public passwordVisible: boolean = false;

    // Submission State
    public submitting: boolean = false;

    constructor(
        private _app: AppService,
        private _snackbar: SnackbarService,
        public _nav: NavService,
        private _auth: AuthService,
        private _user: UserService,
        private _validations: ValidationsService,
        private _utils: UtilsService
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
	get password(): AbstractControl { return <AbstractControl>this.form.get('password') }
	get recaptcha(): AbstractControl { return <AbstractControl>this.form.get('recaptcha') }







    /**
     * Submits the form, retrieves the sign in token and attempts to sign in.
     * If successful, the user is redirected to the Dashboard.
     * @returns void
     */
    public submit(): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: 'Sign In',
            content: `<p class="align-center">Are you sure that you wish to sign into your Plutus account?</p>`,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set Submission State
                    this.submitting = true;
                    try {
                        // Retrieve the sign in token
                        const token: ISignInToken = await this._user.getSignInToken(
                            this.email.value,
                            this.password.value,
                            otp,
                            this.recaptcha.value
                        );

                        // Sign in
                        await this._auth.signIn(token);

                        // After a small delay, redirect the user to the Dashboard
                        this._snackbar.success('The session has been initialized successfully.');
                        await this._utils.asyncDelay(0.5);
                        this._nav.dashboard();
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
}
