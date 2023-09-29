export interface IGuiVersionService { 
    update(version: string, otp: string): Promise<void>
}