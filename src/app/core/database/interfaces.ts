import { Database, DatabaseReference } from "firebase/database";




// Main DB Service
export interface IDatabaseService {
    // Properties
    firebaseDB: Database,
    firebaseDBRef: DatabaseReference,

    // Firebase Ref Paths
    getApiSecretPath(uid: string): string,
    getApiSecretRef(uid: string): DatabaseReference,
}




// DB Management Service
export interface IDatabaseManagementService {
    // Database Summary
    getDatabaseSummary(): Promise<IDatabaseSummary>,
}







// Summary
export interface IDatabaseSummary {
    name: string,
    version: string,
    size: string,
    port: number,
    tables: IDatabaseSummaryTable[]
}
export interface IDatabaseSummaryTable {
    name: string,
    size: string
}