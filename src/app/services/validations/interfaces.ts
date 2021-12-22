import {AbstractControl} from '@angular/forms';


export interface IValidationsService {
	// General User Data
	emailValid(control: AbstractControl): {invalidEmail: boolean}|null,
	passwordValid(control: AbstractControl): {invalidPassword: boolean}|null,
	
	// OTP
	otpValid(control: AbstractControl): {invalidOTP: boolean}|null,
}
