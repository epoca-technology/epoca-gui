import { Injectable } from '@angular/core';
import { IAuthService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements IAuthService {

  constructor() { }
}
