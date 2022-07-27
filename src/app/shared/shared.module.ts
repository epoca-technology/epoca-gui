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
import {MatChipsModule} from '@angular/material/chips';
import {DragDropModule} from '@angular/cdk/drag-drop';

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
import { FilesizePipe } from './pipes/filesize/filesize.pipe';
import { FilterPipe } from './pipes/filter/filter.pipe';
import { SecondToFormatPipe } from './pipes/second-to-format/second-to-format.pipe';
import { StringOverviewPipe } from './pipes/string-overview/string-overview.pipe';





// Shared Components
import { BottomSheetMenuComponent } from './components/bottom-sheet-menu';
import { CandlestickDialogComponent, CandlestickBodyComponent} from './components/candlestick';
import { ConfirmationDialogComponent } from './components/confirmation-dialog';
import { DataDialogComponent } from './components/data-dialog/data-dialog.component';
import { DialogMenuComponent } from './components/dialog-menu/dialog-menu.component';
import { MobileTabsComponent } from './components/mobile-tabs/mobile-tabs.component';
import { ModelDialogComponent } from './components/prediction/model-dialog/model-dialog.component';
import { ModelListDialogComponent } from './components/prediction/model-list-dialog/model-list-dialog.component';
import { ModelContentComponent } from './components/prediction/model-content/model-content.component';
import { PredictionDialogComponent } from './components/prediction/prediction-dialog/prediction-dialog.component';
import { ClassificationElementComponent } from './components/prediction/classification-element/classification-element.component';
import { KerasModelDialogComponent } from './components/prediction/keras-model-dialog/keras-model-dialog.component';
import { RefreshButtonComponent } from './components/refresh-button/refresh-button.component';
import { TooltipDialogComponent } from './components/tooltip-dialog/tooltip-dialog.component';
import { RegressionElementComponent } from './components/prediction/regression-element/regression-element.component';
import { BackgroundTaskComponent } from './components/background-task/background-task.component';
import { ModelSelectionDialogComponent } from './components/prediction/model-selection-dialog/model-selection-dialog.component';






@NgModule({
	declarations: [
		// Directives
		DisableControlDirective,
		
		// Pipes
        FilesizePipe,
		FilterPipe,
		SecondToFormatPipe,
		StringOverviewPipe,

		// Shared Components
		BottomSheetMenuComponent,
        ConfirmationDialogComponent,
        CandlestickDialogComponent,
        CandlestickBodyComponent,
        RefreshButtonComponent,
        MobileTabsComponent,
        ModelDialogComponent,
        ModelListDialogComponent,
        ModelContentComponent,
        PredictionDialogComponent,
		ClassificationElementComponent,
        KerasModelDialogComponent,
        DataDialogComponent,
        DialogMenuComponent,
        TooltipDialogComponent,
        RegressionElementComponent,
        BackgroundTaskComponent,
        ModelSelectionDialogComponent,
	],
	imports: [
		CommonModule,
		
		// Forms
		FormsModule,
		ReactiveFormsModule,
		
		// Flex Layout
		FlexLayoutModule,
		
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
		MatChipsModule,
        DragDropModule,

        // DateTime Picker
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxMatNativeDateModule,

		// Charts
		NgApexchartsModule,
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
		MatChipsModule,
        DragDropModule,

        // DateTime Picker
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxMatNativeDateModule,

		// Charts
		NgApexchartsModule,
				
		// reCAPTCHA
		RecaptchaModule,
        RecaptchaFormsModule,

		// Directives
		DisableControlDirective,
		
		// Pipes
        FilesizePipe,
		FilterPipe,
		SecondToFormatPipe,
		StringOverviewPipe,
		
		// Shared Components
        CandlestickBodyComponent,
        RefreshButtonComponent,
        MobileTabsComponent,
		ModelContentComponent,
		ClassificationElementComponent,
		RegressionElementComponent,
		BackgroundTaskComponent,
	]
})
export class SharedModule { }
