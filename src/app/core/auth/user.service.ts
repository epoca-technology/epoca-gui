import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { IUserService, IUser, IAuthority, ISignInToken } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService implements IUserService {

    constructor(private _api: ApiService) { }



    /* Retrievers */





    /**
     * Retrieves a list of all the existing users in the db.
     * @returns Promise<IUser[]>
     */
    public getAll(): Promise<IUser[]> { return this._api.request('get','auth/getAll', {}, true) }











    /* User Management */





    /**
     * Creates a new users, also retrieves a list of all users when finished.
     * @param email 
     * @param authority 
     * @param otp 
     * @returns Promise<IUser[]>
     */
    public createUser(email: string, authority: IAuthority, otp: string): Promise<IUser[]> { 
        return this._api.request('post','auth/createUser', {email: email, authority: authority}, true, otp);
    }






    /**
     * Updates the user's email, also retrieves a list of all users when finished.
     * @param uid 
     * @param newEmail 
     * @param otp 
     * @returns Promise<IUser[] 
     */
    public updateEmail(uid: string, newEmail: string, otp: string): Promise<IUser[]> { 
        return this._api.request('post','auth/updateEmail', {uid: uid, newEmail: newEmail}, true, otp);
    }





    /**
     * Updates the password for a user.
     * @param email 
     * @param newPassword 
     * @param otp 
     * @param recaptcha 
     * @returns Promise<void>
     */
    public updatePassword(email: string, newPassword: string, otp: string, recaptcha: string): Promise<void> { 
        return this._api.request('post','auth/updatePassword', {email: email, newPassword: newPassword, otp: otp, recaptcha: recaptcha});
    }






    /**
     * Updates the OTP Secret, also retrieves a list of all users when finished.
     * @param uid 
     * @param otp 
     * @returns Promise<IUser[]>
     */
    public updateOTPSecret(uid: string, otp: string): Promise<IUser[]> { 
        return this._api.request('post','auth/updateOTPSecret', {uid: uid}, true, otp);
    }






    /**
     * Updates the Authority, also retrieves a list of all users when finished.
     * @param uid 
     * @param newAuthority 
     * @param otp 
     * @returns Promise<IUser[]>
     */
    public updateAuthority(uid: string, newAuthority: IAuthority, otp: string): Promise<IUser[]> { 
        return this._api.request('post','auth/updateAuthority', {uid: uid, newAuthority: newAuthority}, true, otp);
    }







    /**
     * Updates the FCM Token.
     * @param newFCMToken 
     * @returns Promise<void>
     */
    public updateFCMToken(newFCMToken: IAuthority): Promise<void> { 
        return this._api.request('post','auth/updateFCMToken', {newFCMToken: newFCMToken}, true);
    }







    /**
     * Deletes an user, also retrieves a list of all users when finished.
     * @param uid 
     * @param otp 
     * @returns 
     */
    public deleteUser(uid: string, otp: string): Promise<IUser[]> { 
        return this._api.request('post','auth/deleteUser', {uid: uid}, true, otp);
    }








    /* Sign In */






    /**
     * Based on provided credentials, it will retrieve the sign in token.
     * @param email 
     * @param password 
     * @param otp 
     * @param recaptcha 
     * @returns Promise<ISignInToken>
     */
    public getSignInToken(email: string, password: string, otp: string, recaptcha: string): Promise<ISignInToken> { 
        return this._api.request('post','auth/getSignInToken', {email: email, password: password, otp: otp, recaptcha: recaptcha});
    }
}
