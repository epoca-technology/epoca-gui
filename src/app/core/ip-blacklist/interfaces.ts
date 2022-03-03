

export interface IIPBlacklistService {
    // Retrievers
    getAll(): Promise<IIPBlacklistRecord[]>,

    // IP Management
    registerIP(ip: string, notes: string, otp: string): Promise<IIPBlacklistRecord[]>,
    updateNotes(ip: string, newNotes: string, otp: string): Promise<IIPBlacklistRecord[]>,
    unregisterIP(ip: string, otp: string): Promise<IIPBlacklistRecord[]>,
}





// IP Record
export interface IIPBlacklistRecord {
    ip: string,     // The IP Being Blacklisted
    n?: string      // The notes regarding the IP Blacklist
    c: number,      // Creation Timestamp
}