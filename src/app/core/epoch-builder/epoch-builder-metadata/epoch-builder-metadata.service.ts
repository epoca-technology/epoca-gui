import { IEpochBuilderMetadataService, IEpochBuilderMetadataOutput } from './interfaces';




export class EpochBuilderMetadataService implements IEpochBuilderMetadataService {
	// Metadata Object
	private md: IEpochBuilderMetadataOutput;


	/**
	 * Initializes the metadata instance with an empty object.
	 */
  	constructor() { this.md = {} }







	/**
	 * Checks if a given value is higher or lower than the one stored,
	 * if so, it replaces the current value.
	 * @param mdKey 
	 * @param modelID 
	 * @param value 
	 */
	public update(mdKey: string, modelID: string, value: number): void {
		// Check if the key has already been set
		if (this.md[mdKey]) {
			// Check if the value is greater than the existing one
			if (value > this.md[mdKey].highest.value) this.md[mdKey].highest = { id: modelID, value: value };

			// Check if the value is smaller than the existing one
			if (value < this.md[mdKey].lowest.value) this.md[mdKey].lowest = { id: modelID, value: value };
		}

		// Otherwise, set the provided values
		else {
			this.md[mdKey] = { highest: { id: modelID, value: value }, lowest: { id: modelID, value: value }}
		}
	}







	/**
	 * Returns the metadata that has been put together.
	 * @returns IEpochBuilderMetadataOutput
	 */
	public getMetadata(): IEpochBuilderMetadataOutput { return this.md }
}
