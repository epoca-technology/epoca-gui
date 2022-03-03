import { IUser } from "../../../core";

// Component
export interface IUsersComponent {
    // Navigation
    displayBottomSheet(user: IUser): void,
    gotoIntro(): void,
    gotoUser(user: IUser): void,
    gotoCreateUser(): void,
    gotoUpdateEmail(user: IUser): void,
    gotoUpdateAuthority(user: IUser): void,

    // API Actions
    submitCreateUser(): void,
    submitUpdateEmail(): void,
    updateOTPSecret(user: IUser): void,
    submitUpdateAuthority(): void,
    deleteUser(user: IUser): void,
}





// Component Views
export type IView = 'intro'|'user'|'createUser'|'updateEmail'|'updateAuthority';