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

	// Candlesticks
	{
		path: 'candlesticks',
		loadChildren: () => import('./modules/candlesticks/candlesticks.module').then(m => m.CandlesticksModule),
	},

	// Server
	{
		path: 'server',
		loadChildren: () => import('./modules/server/server.module').then(m => m.ServerModule),
	},


	// Database
	{
		path: 'database',
		loadChildren: () => import('./modules/database/database.module').then(m => m.DatabaseModule),
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
