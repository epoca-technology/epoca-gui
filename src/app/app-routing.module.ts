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

	// Auth
	{
		path: 'auth',
		loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule),
	},

	// Trading Sessions
	{
		path: 'tradingSessions',
		loadChildren: () => import('./modules/trading-sessions/trading-sessions.module').then(m => m.TradingSessionsModule),
	},

	// Trading Simulations
	{
		path: 'tradingSimulations',
		loadChildren: () => import('./modules/trading-simulations/trading-simulations.module').then(m => m.TradingSimulationsModule),
	},

	// Forecast Models
	{
		path: 'forecastModels',
		loadChildren: () => import('./modules/forecast-models/forecast-models.module').then(m => m.ForecastModelsModule),
	},

	// Prediction Backtesting
	{
		path: 'predictionBacktesting',
		loadChildren: () => import('./modules/prediction-backtesting/prediction-backtesting.module').then(m => m.PredictionBacktestingModule),
	},

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

	// Users
	{
		path: 'users',
		loadChildren: () => import('./modules/users/users.module').then(m => m.UsersModule),
	},

	// GUI Version
	{
		path: 'guiVersion',
		loadChildren: () => import('./modules/gui-version/gui-version.module').then(m => m.GuiVersionModule),
	},

	// IP Blacklist
	{
		path: 'ipBlacklist',
		loadChildren: () => import('./modules/ip-blacklist/ip-blacklist.module').then(m => m.IpBlacklistModule),
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
