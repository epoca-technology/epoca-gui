import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { 
	IBinancePositionSide, 
	ICancellationPolicyNames, 
	IIssuancePolicyNames, 
	IPredictionState,
	IPredictionStateIntesity,
	ISignalPolicyCategory,
	ISignalPolicyItemID,
	IStateType,
	ITrendSumState,
	MarketStateService
} from '../../../../core';
import { IPolicyChangePayload, ISignalPolicyItemComponent } from './interfaces';

@Component({
  selector: 'app-signal-policy-item',
  templateUrl: './signal-policy-item.component.html',
  styleUrls: ['./signal-policy-item.component.scss']
})
export class SignalPolicyItemComponent implements OnInit, ISignalPolicyItemComponent {
	// Position Side
	@Input() side!: IBinancePositionSide;

	// Policy Category
	@Input() category!: ISignalPolicyCategory;

	// Policy ID
	@Input() policyID!: IIssuancePolicyNames|ICancellationPolicyNames;

	// Policy Item ID
	@Input() id!: ISignalPolicyItemID;

	// Policy Item Value
	@Input() value!: ITrendSumState|IPredictionState|IStateType;
	@Input() value2?: IPredictionStateIntesity;

	// If enabled, the item cannot be changed
	@Input() immutable: boolean = false;

	// If disabled, the policy item must have a non-neutral option
	@Input() disableable: boolean = true;

    // Policy Change Event
    @Output() valueChanged = new EventEmitter<IPolicyChangePayload>();

	// Helpers
	public isTA?: boolean;
	public readonly sumText: any = {
		"-1": "Trend Sum < 0",
		"0": "Any Trend Sum",
		"1": "Trend Sum > 0"
	};
	public readonly bullishVolText: any = {
		"0": "Any Volume State",
		"1": "Bullish Volume",
		"2": "Strong Bullish Volume",
	};
	public readonly bearishVolText: any = {
		"0": "Any Volume State",
		"1": "Bearish Volume",
		"2": "Strong Bearish Volume",
	};

	constructor(
		public _ms: MarketStateService
	) { }

	ngOnInit(): void {
		this.isTA = this.id == "ta_30m" || this.id == "ta_1h" || this.id == "ta_2h" || this.id == "ta_4h" || this.id == "ta_1d";
	}





	/**
	 * Emmits an event with the policy change payload.
	 * @param newValue
	 * @param newValue2
	 */
	public _valueChanged(newValue: ITrendSumState|IPredictionState|IStateType, newValue2?: IPredictionStateIntesity): void {
		this.valueChanged.emit({
			category: this.category,
			policyID: this.policyID,
			id: this.id,
			payload: {
				newValue: newValue,
				newValue2: newValue2
			}
		}) 
	}
}
