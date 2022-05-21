


export interface IDialogMenuComponent {
    clickAction(response: any): void
}



export interface IDialogMenuItem {
	icon: string,
	title: string,
	description?: string,
	response: any,
	svg?: boolean
}



export interface IDialogMenuData {
	title: string,
	items: IDialogMenuItem[]
}