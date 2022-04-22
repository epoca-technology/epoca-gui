import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { CandlesticksRoutingModule } from './candlesticks-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Components
import { CandlesticksComponent } from './candlesticks/candlesticks.component';
import { CandlesticksConfigDialogComponent } from './candlesticks/candlesticks-config-dialog/candlesticks-config-dialog.component';
import { CandlestickSpreadsheetsDialogComponent } from './candlesticks/candlestick-spreadsheets-dialog/candlestick-spreadsheets-dialog.component';


@NgModule({
  declarations: [
      CandlesticksComponent,
      CandlesticksConfigDialogComponent,
      CandlestickSpreadsheetsDialogComponent
  ],
  imports: [
      CommonModule,
      CandlesticksRoutingModule,
      SharedModule
  ]
})
export class CandlesticksModule { }
