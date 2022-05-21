import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {IBottomSheetMenuComponent, IBottomSheetMenuItem} from "./interfaces";

@Component({
	selector: 'app-bottom-sheet-menu',
	templateUrl: './bottom-sheet-menu.component.html',
	styleUrls: ['./bottom-sheet-menu.component.scss']
})
export class BottomSheetMenuComponent implements OnInit, IBottomSheetMenuComponent {
	constructor(
		private bottomSheetRef: MatBottomSheetRef<BottomSheetMenuComponent>,
		@Inject(MAT_BOTTOM_SHEET_DATA) public items: IBottomSheetMenuItem[],
	) {}
	
	ngOnInit(): void {
	}
	
	
	
	
	
	/*
	* Dimisses the bottom sheet passing down the provided
	* response.
	* @param response
	* @returns void
	* */
	public clickAction(response: any): void {
		this.bottomSheetRef.dismiss(response);
	}
}
