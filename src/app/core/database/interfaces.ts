import { Database, DatabaseReference } from "firebase/database";





export interface IDatabaseService {
    // Properties
    firebaseDB: Database,
    firebaseDBRef: DatabaseReference,

    // Firebase Ref Paths
    getApiSecretPath(uid: string): string,
    getApiSecretRef(uid: string): DatabaseReference,
}