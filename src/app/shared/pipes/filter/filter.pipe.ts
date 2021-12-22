import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filter'
})
export class FilterPipe implements PipeTransform {
	
	transform(items: any[], searchText: string, displayMatchesOnly?: boolean): any[] {
		try {
			// No items
			if(!items) return [];
			
			// Check if only matches should be displayed
			if(!searchText || typeof searchText != "string") {
				if (displayMatchesOnly) {
					return [];
				} else {
					return items;
				}
			}
			
			searchText = searchText.toLowerCase();
			
			return items.filter( it => {
				// String
				if (typeof it == "string") {
					return it.toLowerCase().includes(searchText);
				}
				// Object
				else if (typeof it == "object") {
					const contentString: string = JSON.stringify(it).toLowerCase();
					return contentString.includes(searchText);
				}
				// Not Supported
				else {
					return false;
				}
			});
		} catch(err) {
			console.log(err);
			return items || [];
		}
	}
	
}
