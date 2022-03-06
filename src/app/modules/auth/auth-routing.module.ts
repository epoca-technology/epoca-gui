import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { UpdatePasswordComponent } from './update-password/update-password.component';

const routes: Routes = [
    {
		path: 'signIn',
		component: SignInComponent
	},
    {
		path: 'updatePassword',
		component: UpdatePasswordComponent
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
