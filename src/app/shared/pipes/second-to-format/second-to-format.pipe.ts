import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'secondToFormat'
})
export class SecondToFormatPipe implements PipeTransform {
	transform(remainingSeconds: number): string {
		try{
			if (remainingSeconds > 0) {
				// Set remaining minutes in friendly format
				let minutesLeft = String(Math.floor((remainingSeconds % (1000 * 60 * 60)) / (60)));
				if (minutesLeft.length === 1) {
					minutesLeft = '0' + minutesLeft;
				}
				
				// Set remaining seconds in a friendly format
				let secondsLeft = String(Math.floor(((remainingSeconds * 1000) % (1000 * 60) / 1000)));
				if (secondsLeft.length === 1) {
					secondsLeft = '0' + secondsLeft;
				}
				
				// Return proper format
				return `${minutesLeft}:${secondsLeft}`;
			} else {
				return '00:00';
			}
		}catch(e){
			return '00:00';
		}
	}
}
