import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'stringOverview'
})
export class StringOverviewPipe implements PipeTransform {
	
	transform(value: string, displayChars: number, truncateMode?: boolean): string {
		try{
			if (typeof value == "string" && value.length) {
				// Initialize the fill
				const fill: string = "...";

				// Check if the value actually needs to get cut
				if (value.length <= displayChars + fill.length) {
					return value;
				} else {
					// Init the prefix
					const prefix: string = value.slice(0, displayChars);

					// Include only the head and the fill
					if (truncateMode) {
						return `${prefix}${fill}`;
					} 
					
					// Include the head and the tail separated by the fill
					else {
						const suffix: string = value.slice(value.length - displayChars, value.length);
						return `${prefix}${fill}${suffix}`;
					}
				}
			} else {
				return '';
			}
		}catch(e){
			return '';
		}
	}
	
}
