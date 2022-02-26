import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../services';
import { IpBlacklistComponent } from './ip-blacklist/ip-blacklist.component';

const routes: Routes = [
    {
		path: '',
		component: IpBlacklistComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IpBlacklistRoutingModule { }
