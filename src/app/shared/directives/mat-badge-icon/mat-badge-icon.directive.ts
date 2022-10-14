import { Directive, ElementRef, Input } from "@angular/core";

@Directive({
  selector: "[appMatBadgeIcon]"
})
export class MatBadgeIconDirective {

	@Input() set appMatBadgeIcon( icon: string ) {
		setTimeout(() => {
			try {
				// Retrieve the badge element
				const badge: HTMLElement = this.el.nativeElement.querySelector(".mat-badge-content");
				if (badge) {
					const fontSize: string = this.appMatBadgeIconSize == "large" ? "20px": "13px";
					badge.style.alignItems = "center";
					badge.style.justifyContent = "center";
					if (this.appMatBadgeIconSize == "large") {
						badge.innerHTML = `<i class="material-icons" style="font-size: 20px">${icon}</i>`;
					} else {
						badge.innerHTML = `<i class="material-icons" style="font-size: 13px;margin-top:1px;">${icon}</i>`;
					}
				} else { console.log("The badge icon html element was not found.", badge) }
			} catch (e) { console.log(e) }
		});
	}

	@Input() appMatBadgeIconSize: "large"|"small" = "large";
  
	constructor(private el: ElementRef) {}
}