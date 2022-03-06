

export interface IUtilService {



    // Error Handling
    getCodeFromApiError(error: any): number,
    getErrorMessage(e: any): string,

    // Async Delay
    asyncDelay(seconds: number): Promise<void>
}