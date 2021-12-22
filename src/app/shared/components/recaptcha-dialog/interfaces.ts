export interface IRecaptchaDialogComponent {
	resolved(captchaResponse: string): void,
	errored(error: any): void,
	reset(): void
}
