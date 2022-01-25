

export interface IUtilService {



    // Error Handling
    getCodeFromApiError(error: any): number,
    getErrorMessage(e: any): string,
}