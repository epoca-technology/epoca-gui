import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../services';
import { GuiVersionComponent } from './gui-version/gui-version.component';

const routes: Routes = [
    {
		path: '',
		component: GuiVersionComponent,
		canActivate: [AuthGuard]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuiVersionRoutingModule { }
