import { Injectable } from '@angular/core';
import { IUtilService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class UtilsService implements IUtilService {

    constructor() { }














    /* Error Handling */






    /**
     * Given an API error, it will extract the error code. If none is found, will return 0
     * @param error 
     * @returns number
     */
     public getCodeFromApiError(error: any): number {
        // Retrieve the message if the error is not a string
        if (typeof error != "string") error = this.getErrorMessage(error);

        // Make sure it is a valid string
        if (typeof error == "string" && error.length > 5) {
            // Extract the code
            const code: number = Number(error.substring(
                error.indexOf("{(") + 2, 
                error.lastIndexOf(")}")
            ));

            // If a code was found, return it
            if (code) return Number(code);
        }

        // If a code is not found, return 0 for 'unknown'
        return 0;
    }






    /**
     * Given an error, it will attempt to extract the message.
     * @param e 
     * @returns string
     */
     public getErrorMessage(e: any): string {
        // Unknown error
        const unknownError: string = 'The error message could not be retrieved, find more information in the logs.';

        // Handle String
        if (typeof e == "string") {
            return e;
        }

        // Handle object and deeper keys
        else if (typeof e === "object" && e !== null && e !== undefined) {

            // Check if the message was provided
            if (typeof e.message == "string" && e.message.length) {
                return e.message;
            }

            // Otherwise, stringify the entire object
            return JSON.stringify(e);
        }

        // Unknown error
        else {
            console.log(e);
            return unknownError;
        }
    }
}
