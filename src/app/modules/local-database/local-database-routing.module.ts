import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LocalDatabaseComponent } from './local-database/local-database.component';
import { AuthGuard } from '../../services';

const routes: Routes = [
  {
		path: "",
		component: LocalDatabaseComponent,
		canActivate: [AuthGuard]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LocalDatabaseRoutingModule { }
