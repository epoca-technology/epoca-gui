import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { AuthRoutingModule } from './auth-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Components
import { SignInComponent } from './sign-in/sign-in.component';
import { UpdatePasswordComponent } from './update-password/update-password.component';


@NgModule({
  declarations: [
    SignInComponent,
    UpdatePasswordComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule
  ]
})
export class AuthModule { }
