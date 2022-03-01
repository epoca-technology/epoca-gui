// Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Forms
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';

// Material Design
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatMenuModule} from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTabsModule, MAT_TABS_CONFIG} from '@angular/material/tabs';
import {MatButtonModule} from '@angular/material/button';
import {MatBadgeModule} from '@angular/material/badge';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS} from '@angular/material/snack-bar';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatRippleModule} from '@angular/material/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatBottomSheetModule, MAT_BOTTOM_SHEET_DEFAULT_OPTIONS} from '@angular/material/bottom-sheet';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatTooltipModule} from '@angular/material/tooltip';

// DateTime Picker
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';

// Charts
import { NgApexchartsModule } from "ng-apexcharts";

// Environment
import {environment} from "../../environments/environment";


// reCAPTCHA
import { RecaptchaModule, RecaptchaFormsModule, RECAPTCHA_LANGUAGE, RECAPTCHA_SETTINGS, RecaptchaSettings } from "ng-recaptcha";



// Directives
import { DisableControlDirective } from './directives/disable-control/disable-control.directive';



// Pipes
import { FilterPipe } from './pipes/filter/filter.pipe';
import { SecondToFormatPipe } from './pipes/second-to-format/second-to-format.pipe';




// Bottom Sheets
import { BottomSheetMenuComponent } from './components/bottom-sheet-menu';



// Shared Components
import { RecaptchaDialogComponent } from './components/recaptcha-dialog';
import { ConfirmationDialogComponent } from './components/confirmation-dialog';
import { CandlestickChartComponent, CandlestickDialogComponent } from './components/charts';
import { RefreshButtonComponent } from './components/refresh-button/refresh-button.component';
import { MobileTabsComponent } from './components/mobile-tabs/mobile-tabs.component';






@NgModule({
	declarations: [
		// Directives
		DisableControlDirective,
		
		// Pipes
		FilterPipe,
		SecondToFormatPipe,

        // Bottom Sheets
		BottomSheetMenuComponent,
		
		// Shared Components
        RecaptchaDialogComponent,
        ConfirmationDialogComponent,
        CandlestickChartComponent,
        CandlestickDialogComponent,
        RefreshButtonComponent,
        MobileTabsComponent,
	],
	imports: [
		CommonModule,
		
		// Forms
		FormsModule,
		ReactiveFormsModule,
		
		// Flex Layout
		FlexLayoutModule,

        // Charts
        NgApexchartsModule,
		
		// reCAPTCHA
		RecaptchaModule,
        RecaptchaFormsModule,
		
		// Material Design
		MatCheckboxModule,
		MatFormFieldModule,
		MatInputModule,
		MatRadioModule,
		MatSelectModule,
		MatSlideToggleModule,
		MatMenuModule,
		MatSidenavModule,
		MatToolbarModule,
		MatTabsModule,
		MatButtonModule,
		MatBadgeModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatProgressBarModule,
		MatDialogModule,
		MatSnackBarModule,
		MatDividerModule,
		MatListModule,
		MatRippleModule,
		MatGridListModule,
		MatBottomSheetModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTooltipModule,

        // DateTime Picker
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxMatNativeDateModule,
	],
	providers: [
		// Dialog Defaults
		{provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {autoFocus: false, restoreFocus: false, closeOnNavigation: true}},
		
		// Form Field Defaults
		{provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'standard', floatLabel: 'always'}},
		
		// Snackbar
		{provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 8000}},
		
		// Bottom Sheet
		{provide: MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, useValue: {hasBackdrop: true, disableClose: false, closeOnNavigation: true, autoFocus: false, restoreFocus: false}},
		
		// Tabs
		{provide: MAT_TABS_CONFIG, useValue: {animationDuration: '0ms'}},
		
		// reCAPTCHA
		{provide: RECAPTCHA_LANGUAGE, useValue: 'en'},
		{provide: RECAPTCHA_SETTINGS, useValue: { siteKey: environment.recaptchaKey } as RecaptchaSettings},
	],
	exports: [
		// Forms
		FormsModule,
		ReactiveFormsModule,
		
		// Flex Layout
		FlexLayoutModule,
		
		// Material Design
		MatCheckboxModule,
		MatFormFieldModule,
		MatInputModule,
		MatRadioModule,
		MatSelectModule,
		MatSlideToggleModule,
		MatMenuModule,
		MatSidenavModule,
		MatToolbarModule,
		MatTabsModule,
		MatButtonModule,
		MatBadgeModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatProgressBarModule,
		MatDialogModule,
		MatSnackBarModule,
		MatDividerModule,
		MatListModule,
		MatRippleModule,
		MatGridListModule,
		MatBottomSheetModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTooltipModule,

        // DateTime Picker
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxMatNativeDateModule,
				
		// reCAPTCHA
		RecaptchaModule,
        RecaptchaFormsModule,

		// Directives
		DisableControlDirective,
		
		// Pipes
		FilterPipe,
		SecondToFormatPipe,
		
		// Shared Components
		CandlestickChartComponent,
        RefreshButtonComponent,
        MobileTabsComponent,
	]
})
export class SharedModule { }
