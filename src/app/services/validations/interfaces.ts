import {AbstractControl} from '@angular/forms';


export interface IValidationsService {
	// General User Data
	emailValid(control: AbstractControl): {invalidEmail: boolean}|null,
	passwordValid(control: AbstractControl): {invalidPassword: boolean}|null,
	
    // Authority
    authorityValid(control: AbstractControl): {invalidAuthority: boolean}|null,

	// OTP
	otpValid(control: AbstractControl): {invalidOTP: boolean}|null,

    // GUI Version
    guiVersionValid(control: AbstractControl): {invalidVersion: boolean}|null,

    // IP
    ipValid(control: AbstractControl): {invalidIP: boolean}|null,
    ipNotesValid(control: AbstractControl): {invalidIPNote: boolean}|null,

    // Epoch
    epochIDValid(id: string): boolean,
    controlEpochIDValid(control: AbstractControl): {invalidID: boolean}|null,
}
