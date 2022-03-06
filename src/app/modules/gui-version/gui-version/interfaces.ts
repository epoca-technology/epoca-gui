export interface IGuiVersionComponent {
    reload(): Promise<void>,
    enableEditMode(): void,
    save(): void
}