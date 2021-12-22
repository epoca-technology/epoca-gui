export interface IConfirmationDialogComponent {
	confirmWithOTP(): void,
	pasteOTP(): Promise<void>,
	confirm(otp?: string): void,
	cancel(): void
}




// Config
export interface IConfirmationDialogData {
	title?: string,
	content?: string,
	otpConfirmation?: boolean
}
