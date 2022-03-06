
// Service
export interface IApiErrorService {
    // Retrievers
    getAll(): Promise<IApiError[]>,

    // Cleaner
    deleteAll(otp: string): Promise<IApiError[]>,
}




// Record
export interface IApiError {
    o: string,      // Origin (F.e: AuthRoute.createUser or CandlestickService.syncCandlesticks)
    e: string,      // Error Message
    c: number,      // Creation Timestamp
    uid?: string,   // Request Sender UID
    ip?: string,    // Request Sender IP
    p?: any,        // Params used to trigger the error
}