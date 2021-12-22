import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { AuthGuard } from './services/nav/auth.guard';

const routes: Routes = [
    /* Pre Loaded Components */
	{
		path: 'dashboard',
		component: DashboardComponent,
		canActivate: [AuthGuard]
	},



	/* Lazy Loaded Modules */
	
	// Forecast
	{
		path: 'forecast',
		loadChildren: () => import('./modules/forecast/forecast.module').then(m => m.ForecastModule),
	},






	/* Empty Path */
	{
		path: '',
		redirectTo: '/dashboard',
		pathMatch: 'full'
	},
	
	
    
	/* 404 Not Found */
	{
        path: '**',
		redirectTo: '/dashboard'
	}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
