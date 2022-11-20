import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./modules/dashboard/dashboard.component";
import { AuthGuard } from "./services/nav/auth.guard";

const routes: Routes = [
    /* Pre Loaded Components */
	{
		path: "dashboard",
		component: DashboardComponent,
		canActivate: [AuthGuard]
	},



	/* Lazy Loaded Modules */

	// Auth
	{
		path: "auth",
		loadChildren: () => import("./modules/auth/auth.module").then(m => m.AuthModule),
	},

	// Epochs
	{
		path: "epochs",
		loadChildren: () => import("./modules/epochs/epochs.module").then(m => m.EpochsModule),
	},

	// Trading Sessions
	{
		path: "tradingSessions",
		loadChildren: () => import("./modules/trading-sessions/trading-sessions.module").then(m => m.TradingSessionsModule),
	},

	// Market State
	{
		path: "marketState",
		loadChildren: () => import("./modules/market-state/market-state.module").then(m => m.MarketStateModule),
	},

	// Predictions
	{
		path: "predictions",
		loadChildren: () => import("./modules/predictions/predictions.module").then(m => m.PredictionsModule),
	},

	// Candlesticks
	{
		path: "candlesticks",
		loadChildren: () => import("./modules/candlesticks/candlesticks.module").then(m => m.CandlesticksModule),
	},

	// Order Book
	{
		path: "orderBook",
		loadChildren: () => import("./modules/order-book/order-book.module").then(m => m.OrderBookModule),
	},

	// Server
	{
		path: "server",
		loadChildren: () => import("./modules/server/server.module").then(m => m.ServerModule),
	},

	// Users
	{
		path: "users",
		loadChildren: () => import("./modules/users/users.module").then(m => m.UsersModule),
	},

	// GUI Version
	{
		path: "guiVersion",
		loadChildren: () => import("./modules/gui-version/gui-version.module").then(m => m.GuiVersionModule),
	},

	// IP Blacklist
	{
		path: "ipBlacklist",
		loadChildren: () => import("./modules/ip-blacklist/ip-blacklist.module").then(m => m.IpBlacklistModule),
	},

	// Epoch Builder
	{
		path: "epochBuilder",
		loadChildren: () => import("./modules/epoch-builder/epoch-builder.module").then(m => m.EpochBuilderModule),
	},

	// Local Database
	{
		path: "localDatabase",
		loadChildren: () => import("./modules/local-database/local-database.module").then(m => m.LocalDatabaseModule),
	},



	/* Empty Path */
	{
		path: "",
		redirectTo: "/dashboard",
		pathMatch: "full"
	},
	
	
    
	/* 404 Not Found */
	{
        path: "**",
		redirectTo: "/dashboard"
	}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
