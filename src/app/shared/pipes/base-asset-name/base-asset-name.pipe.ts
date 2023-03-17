import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'baseAssetName'
})
export class BaseAssetNamePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
		if (typeof value == "string" && value.length >= 5) {
			return value.replace("USDT", "");
		} else { return "" }
  }

}
