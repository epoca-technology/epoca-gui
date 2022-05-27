import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'stringOverview'
})
export class StringOverviewPipe implements PipeTransform {
	
	transform(value: string, displayChars: number): string {
		try{
			if (typeof value == "string" && value.length) {
				const preffix: string = value.slice(0, displayChars);
				const suffix: string = value.slice(value.length - displayChars, value.length);
				return `${preffix}******${suffix}`
			} else {
				return '';
			}
		}catch(e){
			return '';
		}
	}
	
}
