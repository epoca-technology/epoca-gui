// Core
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Root routing
import { AppRoutingModule } from './app-routing.module';

// Browser Animations
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// HTTP Module
import { HttpClientModule } from '@angular/common/http';

// Service Worker
import { ServiceWorkerModule } from '@angular/service-worker';

// Big Number
import {BigNumber} from 'bignumber.js';
BigNumber.config({EXPONENTIAL_AT: 32});

// Environment
import { environment } from '../environments/environment';

// Initialize Firebase
import {initializeApp} from 'firebase/app';
initializeApp(environment.firebaseConfig.credentials);


// Core
import {
    ApiService,
    ApiErrorService,
    AuthService,
    UserService,
    CandlestickService,
    DatabaseService,
    DatabaseManagementService,
    ExternalRequestService,
	GuiVersionService,
	IpBlacklistService,
	NotificationService,
	ServerService,
	UtilsService,
} from './core';


// Services
import {
	AppService,
    AudioService,
	ChartService,
	ClipboardService,
	NavService,
	SnackbarService,
	ValidationsService,
} from './services';


// Shared Module
import {SharedModule} from "./shared";


// Pre-Loaded Components
import { DashboardComponent } from './modules/dashboard/dashboard.component';


// Core Components
import { AppComponent } from './app.component';






@NgModule({
	declarations: [
		// Core Component
		AppComponent,

		// Pre-Loaded Components
		DashboardComponent
	],
	imports: [
		// Core
		BrowserModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		HttpClientModule,

		// Service Worker
		ServiceWorkerModule.register('firebase-messaging-sw.js', {
			enabled: true, // environment.production
			// Register the ServiceWorker as soon as the app is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: 'registerImmediately'
		}),

		// Shared Module
		SharedModule,
	],
	providers: [
        // Core
        ApiService,
        ApiErrorService,
        AuthService,
        UserService,
        CandlestickService,
        DatabaseService,
        DatabaseManagementService,
        ExternalRequestService,
        GuiVersionService,
        IpBlacklistService,
        NotificationService,
        ServerService,
        UtilsService,


		// Services 
		AppService,
        AudioService,
        ChartService,
		ClipboardService,
		NavService,
		SnackbarService,
		ValidationsService,
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
