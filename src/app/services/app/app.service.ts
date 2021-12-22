import {Injectable} from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import {IAppService, ILayout, ILayoutAlias} from "./interfaces";

import {BehaviorSubject} from "rxjs";

@Injectable({
	providedIn: 'root'
})
export class AppService implements IAppService{
	// Layout
	public layout: BehaviorSubject<ILayout>;
	
	
	constructor(
		private mediaObserver: MediaObserver
	) {
		// Initialize the Layout
		this.layout = new BehaviorSubject<ILayout>(this.getLayout());
		this.mediaObserver.asObservable().subscribe(
			(change: MediaChange[]) => {
				const alias: ILayoutAlias|undefined =
					change && change[0] && change[0].mqAlias ? <ILayoutAlias>change[0].mqAlias: undefined;
				const newLayout: ILayout = this.getLayout(alias);
				if (this.layout.value != newLayout) this.layout.next(newLayout);
			}
		);



	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	/* Layout Helpers */
	
	
	
	
	
	/*
	* Retrieves the layout based
	* on the device's width
	* @param currentAlias?
	* @returns ILayout
	* */
	private getLayout(currentAlias?: ILayoutAlias): ILayout {
		if (typeof currentAlias == "string") {
			switch (currentAlias) {
				case 'xs':
				case 'sm':
					return 'mobile';
				default:
					return 'desktop';
			}
		} else {
			if (this.mediaObserver.isActive('xs') || this.mediaObserver.isActive('sm')) {
				return 'mobile';
			}  else {
				return 'desktop';
			}
		}
	}
}
