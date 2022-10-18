import { Injectable } from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {IValidationsService} from "./interfaces";

@Injectable({
	providedIn: 'root'
})
export class ValidationsService implements IValidationsService{
	
	constructor() { }
	
	
	
	
	
	
	/* General User Data */
	
	
	
	
	
	
	/*
	* Verifies if the email has a
	* valid format
	* @param control
	* @returns {invalidEmail: boolean}|null
	* */
	public emailValid(control: AbstractControl): {invalidEmail: boolean}|null {
		if(control && typeof control.value == "string" && control.value.length) {
			const regx: any = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
			if (!regx.test(control.value)) {
				return {invalidEmail: true}
			} else {
				return null;
			}
		} else {
			return {invalidEmail: true}
		}
	}
	
	
	
	
	
	
	/*
	 * Verifies if the password has a
	 * valid format
	 * @param control
	 * @returns {invalidPassword: boolean}|null
	 * */
	public passwordValid(control: AbstractControl): {invalidPassword: boolean}|null {
        // Perform basic validations
        if (
            control && 
            typeof control.value == "string" && 
            control.value.length >= 8 &&
            control.value.length <= 200
        ) {
            // Init regular expressions
            const anUpperCase: RegExp = /[A-Z]/;
            const aLowerCase: RegExp = /[a-z]/;
            const aNumber: RegExp = /[0-9]/;

            // Init the counters
            let numUpper: number = 0;
            let numLower: number = 0;
            let numNums: number = 0;

            // Iterate over each password character
            for (let i = 0; i < control.value.length; i++) {
                if(anUpperCase.test(control.value[i])) { numUpper++ }
                else if(aLowerCase.test(control.value[i])) { numLower++ }
                else if(aNumber.test(control.value[i])) { numNums++ }
            }

            // Make sure that at least one of each was found
            if (numUpper > 0 && numLower > 0 && numNums > 0) {
                return null;
            } else {
                return {invalidPassword: true}; 
            }
        } else { 
            return {invalidPassword: true}; 
        }
	}
	
	
	




	
	/* Authority */
	
	
	
	
	/*
	* Verifies if an authority is valid
	* @param control
	* @returns {invalidAuthority: boolean}|null
	* */
	public authorityValid(control: AbstractControl): {invalidAuthority: boolean}|null {
		if(control && typeof control.value == "number" && control.value >= 1 && control.value <= 4) {
            return null;
		} else {
			return {invalidAuthority: true}
		}
	}



	
	
	

	
	
	
	
	
	/* OTP */
	
	
	
	
	/*
	* Verifies if a otp code is valid
	* @param control
	* @returns {invalidOTP: boolean}|null
	* */
	public otpValid(control: AbstractControl): {invalidOTP: boolean}|null {
		if(control && typeof control.value == "string" && control.value.length) {
			const regx: any = /^([\d]){6}$/g;
			if (!regx.test(control.value)) {
				return {invalidOTP: true}
			} else {
				return null;
			}
		} else {
			return {invalidOTP: true}
		}
	}
	
	
	
	
	








    /* GUI Version */
	
	

	/*
	* Verifies if a GUI version is valid.
	* @param control
	* @returns {invalidVersion: boolean}|null
	* */
	public guiVersionValid(control: AbstractControl): {invalidVersion: boolean}|null {
		if(
            control && 
            typeof control.value == "string" && 
            control.value.length >= 5 &&
            control.value.length <= 15 &&
            control.value.split('.').length == 3
        ) {
            return null;
		} else {
			return {invalidVersion: true}
		}
	}










    /* IP */




	/*
	* Verifies if an IP is valid
	* @param control
	* @returns {invalidIP: boolean}|null
	* */
	public ipValid(control: AbstractControl): {invalidIP: boolean}|null {
		if(
            control && 
            typeof control.value == "string" && 
            control.value.length >= 5 &&
            control.value.length <= 300
        ) {
            return null;
		} else {
			return {invalidIP: true}
		}
	}






	/*
	* Verifies if an IP Note is valid
	* @param control
	* @returns {invalidIPNote: boolean}|null
	* */
	public ipNotesValid(control: AbstractControl): {invalidIPNote: boolean}|null {
        if (control && typeof control.value == "string") {
            if (control.value.length == 0) {
                return null;
            } else if (
                control.value.length >= 5 &&
                control.value.length <= 3000
            ) {
                return null;
            } else {
                return {invalidIPNote: true};
            }
        } else {
            return {invalidIPNote: true};
        }
	}






	/* Epoch */




    /**
     * Verifies if a provided Epoch ID is valid.
     * @param id 
     * @returns boolean
     */
	 public epochIDValid(id: string): boolean {
        return typeof id == "string" && id.length >= 4 && id.length <= 100 && id[0] == "_";
    }



	/*
	* Verifies if an Epoch ID in a control is valid.
	* @param control
	* @returns {invalidID: boolean}|null
	* */
	public controlEpochIDValid(control: AbstractControl): {invalidID: boolean}|null {
        if (control && typeof control.value == "string") {
			const id: string = control.value;
            if (typeof id == "string" && id.length >= 4 && id.length <= 100 && id[0] == "_") {
                return null;
            } else {  return {invalidID: true} }
        } else {
            return {invalidID: true};
        }
	}


	


    /**
     * Verifies if a provided Regression or Prediction Model ID is valid.
     * @param id 
     * @returns boolean
     */
     public modelIDValid(id: string): boolean {
        return typeof id == "string" && id.length >= 30 && id.length <= 200;
    }
}
