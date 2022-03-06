export interface IGuiVersionService { 
    get(): Promise<string>,
    update(version: string, otp: string): Promise<void>
}