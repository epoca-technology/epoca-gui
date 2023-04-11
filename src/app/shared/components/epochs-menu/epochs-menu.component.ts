import { Component, Output, OnInit, EventEmitter, ViewChild, ElementRef } from "@angular/core";
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import { EpochService, IEpochListItem, IEpochRecord } from "../../../core";
import { AppService, ValidationsService } from "../../../services";



@Component({
  selector: "app-epochs-menu",
  templateUrl: "./epochs-menu.component.html",
  styleUrls: ["./epochs-menu.component.scss"]
})
export class EpochsMenuComponent implements OnInit {
    // Epoch ID Event Emitter
    @Output() epochID = new EventEmitter<string>();

	// The list of epoch items
	public epochs: IEpochListItem[] = [];
	public limit: number = 5;
	public hasMore?: boolean;

	// Epoch Searcher
    @ViewChild("searchQueryControl") searchQueryControl? : ElementRef;
	public form = new FormGroup ({searchQuery: new FormControl('',[ this._validations.controlEpochIDValid ])});
	public searchEnabled: boolean = false;


	// Load state
	public loaded: boolean = false;

	// Submission state
	public submitting: boolean = false;


	constructor(
		private _epoch: EpochService,
		private _app: AppService,
		private _validations: ValidationsService
	) { }




	/* Form Getters */
	get searchQuery(): AbstractControl { return <AbstractControl>this.form.get("searchQuery") }




	async ngOnInit(): Promise<void> {
		// Load the initial lot of epochs
		await this.loadEpochs();

		// Update the state
		this.loaded = true;
	}





	/* Epochs Loader */




	/**
	 * Loads more epoch list items based on the provided starting point.
	 * @param startAt 
	 * @returns Promise<void>
	 */
	public async loadEpochs(): Promise<void> {
		// Init the submission state
		this.submitting = true;

		// Calculate the starting point
		const startAt: number = this.epochs.length > 0 ? this.epochs[this.epochs.length - 1].installed: 0;

		try {
			// Retrieve the tail
			const tail: IEpochListItem[] = await this._epoch.listEpochs(startAt, this.limit);

			// Update the current list
			this.epochs = this.epochs.concat(tail);

			// Check if there are more records
			this.hasMore = tail.length == this.limit;
		} catch (e) { this._app.error(e)  }

		// Update the state
		this.submitting = false;
	}








	/* Epoch Search */





	/**
	 * Enables the search mode and focuses the input.
	 */
	public enableSearch(): void {
		this.searchEnabled = true;
		setTimeout(() => { this.searchQueryControl?.nativeElement.focus() }, 100);
	}





	/**
	 * Disables the search mode and sets the defaults.
	 */
	public disableSearch(): void {
		this.searchQuery.setValue(null);
		this.searchEnabled = false;
	}






	/**
	 * When the search form is submitted, a request is sent to the API.
	 * If an Epoch is found with the provided ID, it will activate it 
	 * right away. Otherwise, it displays the error.
	 * @returns Promise<void>
	 */
	public async performSearch(): Promise<void> {
		// Only if the search query is valid
		if (this.searchQuery.invalid || this.submitting) return;

		// Init the submission state
		this.submitting = true;

		try {
			// Init the epoch id
			const epochID: string = this.searchQuery.value.toUpperCase();

			// Retrieve the record
			const record: IEpochRecord|undefined = await this._epoch.getEpochRecord(epochID);

			// If the record exists, activate it right away. Otherwise, display an error
			if (record) { this.activateEpoch(record.id) }
			else { this._app.error(`The Epoch ${epochID} was not found in the database.`) }
		} catch (e) { this._app.error(e)  }

		// Update the state
		this.submitting = false;
	}








	/* Epoch Activation */



    /**
     * Emmits the selected Epoch ID to the parent component.
     */
	public activateEpoch(epochID: string): void { this.epochID.emit(epochID) }
}
