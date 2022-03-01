import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core';
import {NavService} from "./nav.service";

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {
	constructor(
        private _nav: NavService,
        private _auth: AuthService
    ) {}
	
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		return new Observable((observer) => {
			this._auth.uid.subscribe(
				(uid: string|null|undefined) => {
					if (uid !== undefined) {
						if (typeof uid == "string") {
							observer.next(true);
						} else {
							observer.next(false);
							this._nav.signIn();
						}
					}
				}
			);
		});
	}
}
