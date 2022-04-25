export interface IBottomSheetMenuComponent {
	clickAction(response: string): void
}


export interface IBottomSheetMenuItem {
	icon: string,
	title: string,
	description: string,
	response: any,
	svg?: boolean
}
