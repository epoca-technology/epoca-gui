export interface IBottomSheetMenuComponent {
	clickAction(response: any): void
}


export interface IBottomSheetMenuItem {
	icon: string,
	title: string,
	description: string,
	response: any,
	svg?: boolean
}
