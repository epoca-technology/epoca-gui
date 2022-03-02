import { BehaviorSubject } from "rxjs";

// Auth Service
export interface IAuthService {
    // Properties
    uid: BehaviorSubject<string|null|undefined>,
    
    // Auth Management
    signIn(signInToken: string): Promise<void>,
    signOut(): Promise<void>,

    // ID Token
    getIDToken(): Promise<string>,
    idTokenInvalid(): void,

    // API Secret
    getAPISecret(): Promise<string>,
    apiSecretIsInvalid(): void,
}





// User Service
export interface IUserService {
    // Retrievers
    getAll(): Promise<IUser[]>,

    // User Management
    createUser(email: string, authority: IAuthority, otp: string): Promise<IUser[]>,
    updateEmail(uid: string, newEmail: string, otp: string): Promise<IUser[]>,
    updatePassword(email: string, newPassword: string, otp: string, recaptcha: string): Promise<void>,
    updateOTPSecret(uid: string, otp: string): Promise<IUser[]>,
    updateAuthority(uid: string, newAuthority: IAuthority, otp: string): Promise<IUser[]>,
    updateFCMToken(newFCMToken: string): Promise<void>,
    deleteUser(uid: string, otp: string): Promise<IUser[]>,
    
    // Sign In
    getSignInToken(email: string, password: string, otp: string, recaptcha: string): Promise<string>,
}






// User
export interface IUser {
    uid: string,
    email: string,
    otp_secret: string,
    authority: IAuthority,
    fcm_token?: string,
    creation: number
}




// Authority
export type IAuthority = 1|2|3|4|5;




