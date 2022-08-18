
// Component
export interface IEpochBuilderConfigDialogComponent {
    toggle(id: string|any): void,
    close(limit?: number): void
}



// The configuration that needs to be passed to the component
export interface IEpochBuilderConfigDialog {
    title: string,
    items: IEpochBuilderConfigDialogItem[]
}



// An item that can be selected by the user
export interface IEpochBuilderConfigDialogItem {
    id: string|any,
    name: string,
    description: string,
    icon: string,
    svg?: boolean
}



// The response from when component was the required options have been selected
export interface IEpochBuilderConfigDialogResponse {
    id: string|any,
    limit: number
}