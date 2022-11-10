import { Pipe, PipeTransform } from '@angular/core';
import * as moment from "moment";

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {

	transform(value: number, ...args: unknown[]): unknown {
		try {
			return moment(value).fromNow();
		} catch (e) {
			console.log(e);
			return "Unknown time ago";
		}
	}

}
