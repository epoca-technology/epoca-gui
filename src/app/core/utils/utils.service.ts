import { Injectable } from '@angular/core';
import {BigNumber} from "bignumber.js";
import { INumber, INumberConfig, IUtilService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class UtilsService implements IUtilService {

    constructor() { }




    /* Numbers  */






    /**
     * Given a value and a percent change, it will detect if it has to be increased or 
     * decreased.
     * @param value 
     * @param percent 
     * @param config? 
     * @returns INumber
     */
    public alterNumberByPercentage(
        value: INumber, 
        percent: INumber, 
        config?: INumberConfig
    ): INumber {
        // Init the new number
        let newNumber: BigNumber;
        let percentBN: BigNumber = this.getBigNumber(percent);

        // Handle an increase
        if (percentBN.isGreaterThan(0)) {
            newNumber = percentBN.dividedBy(100).plus(1).times(value);
        } 
        
        // Handle a decrease
        else if (percentBN.isLessThan(0)) {
            newNumber = percentBN.times(-1).dividedBy(100).minus(1).times(value).times(-1);
        }

        // Return the same value in case of 0%
        else {
            newNumber = this.getBigNumber(value);
        }

        // Return the new number
        return this.outputNumber(newNumber, config);
    }









    /**
     * Given an old and a new number, it will calculate the % difference between the 2.
     * @param oldNumber 
     * @param newNumber 
     * @param config?
     * @returns INumber
     */
    public calculatePercentageChange(
        oldNumber: INumber, 
        newNumber: INumber, 
        config?: INumberConfig
    ): INumber {
        // Init values
        const oldBN: BigNumber = this.getBigNumber(oldNumber);
        const newBN: BigNumber = this.getBigNumber(newNumber);
        let change: BigNumber;

        // Handle an increase
        if (newBN.isGreaterThan(oldBN)) {
            const increase: BigNumber = newBN.minus(oldBN);
            change = increase.dividedBy(oldNumber).times(100);
        } 
        
        // Handle a decrease
        else if (oldBN.isGreaterThan(newBN)) {
            const decrease: BigNumber = oldBN.minus(newBN);
            change = decrease.dividedBy(oldNumber).times(100).times(-1);
        }

        // Handle the exact same value
        else {
            change = new BigNumber(0);
        }

        // Return the % change
        return this.outputNumber(change, config);
    }









    /**
     * Calculates the % represented by the value out of a total.
     * @param value 
     * @param total 
     * @param config?
     * @returns INumber
     */
     public calculatePercentageOutOfTotal(
        value: INumber, 
        total: INumber, 
        config?: INumberConfig
    ): INumber {
        // Initialize the BigNumber Instance out of the value
        const bn: BigNumber = this.getBigNumber(value);

        // Calculate the % it represents
        return this.outputNumber(bn.times(100).dividedBy(total), config);
    }













    /**
     * Given a value, it will adjust the decimal places and return it in the desired
     * format.
     * @param value 
     * @param config? 
     * @returns INumber
     */
    public outputNumber(value: INumber, config?: INumberConfig): INumber {
        // Init the config
        config = this.getNumberConfig(config);

        // Retrieve the Big Number and set the decimal places
        const bn: BigNumber = this.getBigNumber(value).decimalPlaces(config.dp!, config.rm);

        // Return the desired format
        switch(config.of) {
            case 's':
                return bn.toString();
            case 'n':
                return bn.toNumber();
            case 'bn':
                return bn;
            default:
                throw new Error(`The provided output format ${config.of} is invalid.`);
        }
    }








    
    /**
     * It will retrieve a BigNumber based on the value's format
     * @param value 
     * @returns BigNumber
     */
    public getBigNumber(value: INumber): BigNumber {
        if (BigNumber.isBigNumber(value)) { return value } else { return new BigNumber(value) }
    } 










    /**
     * Given the provided configuration, it will fill the parameters that weren't 
     * provided with defaults.
     * @param config 
     * @returns INumberConfig
     */
    private getNumberConfig(config?: INumberConfig): INumberConfig {
        // Init the config
        config = config ? config: {};

        // Return the final
        return {
            dp: typeof config.dp == "number" ? config.dp: 2,
            rm: config.ru == true ? BigNumber.ROUND_UP: BigNumber.ROUND_DOWN,
            of: typeof config.of == "string" ? config.of: 'n'
        }
    }






    /**
     * Given a list of numbers, it will retrieve the one with the highest value.
     * @param values 
     * @returns INumber
     */
    public getMax(values: INumber[], config?: INumberConfig): INumber { 
        return this.outputNumber(BigNumber.max.apply(null, values), config);
    }





    /**
     * Given a list of numbers, it will retrieve the one with the lowest value.
     * @param values 
     * @returns INumber
     */
    public getMin(values: INumber[], config?: INumberConfig): INumber { 
        return this.outputNumber(BigNumber.min.apply(null, values), config);
    }






    /**
     * Given a list of numbers, it will calculate the sum of all of them
     * @param values 
     * @returns INumber
     */
    public getSum(values: INumber[], config?: INumberConfig): INumber { 
        return this.outputNumber(BigNumber.sum.apply(null, values), config);
    }






    /**
     * Given a list of numbers, it will calculate the mean value
     * @param values 
     * @param config?
     * @returns INumber
     */
    public getMean(values: INumber[], config?: INumberConfig): INumber { 
        return this.outputNumber(
            new BigNumber(this.getSum(values)).dividedBy(values.length), config
        );
    }





    /**
     * Converts a numeric value into a readable string format.
     * @param value 
     * @param dp? 
     * @returns string
     */
    public formatNumber(value: number, dp?: number): string {
        return new BigNumber(value).toFormat(typeof dp == "number" ? dp: 2);
    }













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
        const unknownError: string = 
            'The error message could not be retrieved, find more information in the logs.';

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















    /* Async Delay */



    /**
     * It will create a promise that will resolve after provided seconds have passed.
     * This functionality is used to prevent our requests being blocked by external sources.
     * @param seconds 
     */
     public asyncDelay(seconds: number = 3): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, seconds * 1000);
        });
    }
}
