import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filesize'
})
export class FilesizePipe implements PipeTransform {

    transform(value: unknown, ...args: unknown[]): unknown {
		if (typeof value == "number" && value > 0) {
			return humanFileSize(value);
		} else {
			return '-1 B';
		}
    }

}




/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
 function humanFileSize(bytes: number, dp: number = 1) {
	const thresh: number = 1024;

	if (Math.abs(bytes) < thresh) {
		return bytes + ' B';
	}

	const units: string[] = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	let u = -1;
	const r = 10**dp;

	do {
		bytes /= thresh;
		++u;
	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


	return bytes.toFixed(dp) + ' ' + units[u];
}