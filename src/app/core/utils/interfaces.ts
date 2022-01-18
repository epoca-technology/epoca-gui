

export interface IUtilService {



    // Error Handling
    getCodeFromApiError(error: string): number,
    getErrorMessage(e: any): string,
}