import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServerComponent } from './server/server.component';
import { AuthGuard } from '../../services/nav/auth.guard';

const routes: Routes = [
    {
		path: '',
		component: ServerComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServerRoutingModule { }
