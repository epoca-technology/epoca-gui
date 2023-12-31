// Core
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

// Root routing
import { AppRoutingModule } from "./app-routing.module";

// Browser Animations
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

// HTTP Module
import { HttpClientModule } from "@angular/common/http";

// Service Worker
import { ServiceWorkerModule } from "@angular/service-worker";

// Big Number
import {BigNumber} from "bignumber.js";
BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN, EXPONENTIAL_AT: 32 });

// Environment
import { environment } from "../environments/environment";

// Initialize Firebase
import {initializeApp} from "firebase/app";
initializeApp(environment.firebaseConfig.credentials);


// Core
import {
	// API
    ApiService,

	// API Error
    ApiErrorService,

	// Auth
    AuthService,
    UserService,

	// Bulk Data
	BulkDataService,

	// Candlestick
    CandlestickService,

	// Database
    DatabaseService,
    DatabaseManagementService,

	// External Request
    ExternalRequestService,

	// File
    FileService,

	// GUI Version
	GuiVersionService,

	// IP Blacklist
	IpBlacklistService,

	// Local Database
	LocalDatabaseService,

	// Market State
	MarketStateService,

	// Notification
	NotificationService,

	// Position
	PositionService,

	// Server
	ServerService,

	// Transaction
	TransactionService,

	// Utils
	UtilsService
} from "./core";


// Services
import {
	AppService,
	ChartService,
	NavService,
	ValidationsService,
} from "./services";


// Shared Module
import {SharedModule} from "./shared";


// Pre-Loaded Components
import { 
	BalanceDialogComponent, 
	DashboardComponent, 
	KeyzonesDialogComponent,
	KeyzoneDetailsDialogComponent,
	KeyzonesPriceSnapshotsDialogComponent,
	KeyzonesEventsDialogComponent,
	KeyzoneEventContextDialogComponent,
	MarketStateDialogComponent,
	LiquidityDialogComponent,
	CoinsStateSummaryDialogComponent,
	ReversalStateDialogComponent
} from "./modules/dashboard";


// Core Components
import { AppComponent } from "./app.component";







@NgModule({
	declarations: [
		// Core Component
		AppComponent,

		// Pre-Loaded Components
		DashboardComponent,
		BalanceDialogComponent,
		KeyzonesDialogComponent,
    	KeyzoneDetailsDialogComponent,
		KeyzonesPriceSnapshotsDialogComponent,
		KeyzonesEventsDialogComponent,
		KeyzoneEventContextDialogComponent,
  		MarketStateDialogComponent,
    	LiquidityDialogComponent,
		CoinsStateSummaryDialogComponent,
		ReversalStateDialogComponent,
	],
	imports: [
		// Core
		BrowserModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		HttpClientModule,

		// Service Worker
		ServiceWorkerModule.register("firebase-messaging-sw.js", {
			enabled: true, // environment.production
			// Register the ServiceWorker as soon as the app is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: "registerImmediately"
		}),

		// Shared Module
		SharedModule,
	],
	providers: [
		/* Core */

		// API
		ApiService,

		// API Error
		ApiErrorService,

		// Auth
		AuthService,
		UserService,

		// Bulk Data
		BulkDataService,

		// Candlestick
		CandlestickService,

		// Database
		DatabaseService,
		DatabaseManagementService,

		// External Request
		ExternalRequestService,

		// File
		FileService,

		// GUI Version
		GuiVersionService,

		// IP Blacklist
		IpBlacklistService,

		// Local Database
		LocalDatabaseService,

		// Market State
		MarketStateService,

		// Notification
		NotificationService,

		// Position
		PositionService,

		// Server
		ServerService,

		// Transaction Service
		TransactionService,
		
		// Utils
		UtilsService,


		/* Services */ 
		AppService,
        ChartService,
		NavService,
		ValidationsService,
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
