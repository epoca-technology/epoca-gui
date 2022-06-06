import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'stringOverview'
})
export class StringOverviewPipe implements PipeTransform {
	
	transform(value: string, displayChars: number, fill?: string): string {
		try{
			if (typeof value == "string" && value.length) {
				// Initialize the fill
				fill = fill ? fill: "******";

				// Check if the value actually needs to get cut
				if (value.length <= displayChars) {
					return value;
				} else {
					const preffix: string = value.slice(0, displayChars);
					const suffix: string = value.slice(value.length - displayChars, value.length);
					return `${preffix}${fill}${suffix}`
				}
			} else {
				return '';
			}
		}catch(e){
			return '';
		}
	}
	
}
