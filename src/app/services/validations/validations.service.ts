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
		if(control && typeof control.value == "string" && control.value.length) {
			if (control.value.length > 7 && control.value.length < 36) {
				const anUpperCase = /[A-Z]/;
				const aLowerCase = /[a-z]/;
				const aNumber = /[0-9]/;
				
				let numUpper = 0;
				let numLower = 0;
				let numNums = 0;
				
				for(let i = 0; i < control.value.length; i++){
					if(anUpperCase.test(control.value[i]))
						numUpper++;
					else if(aLowerCase.test(control.value[i]))
						numLower++;
					else if(aNumber.test(control.value[i]))
						numNums++;
				}
				
				if(numUpper < 1 || numLower < 1 || numNums < 1){
					return {invalidPassword: true}
				} else {
					return null;
				}
			}else {
				return {invalidPassword: true}
			}
		} else {
			return {invalidPassword: true}
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
	
	
	
	
	
	
	
}
