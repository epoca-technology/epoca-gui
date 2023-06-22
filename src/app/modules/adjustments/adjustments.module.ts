import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


// Routing
import { AdjustmentsRoutingModule } from './adjustments-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Components
import { AdjustmentsComponent } from './adjustments/adjustments.component';
import { WindowConfigurationDialogComponent } from './adjustments/window-configuration-dialog';
import { KeyzonesConfigFormDialogComponent } from './adjustments/keyzones-config-form-dialog';
import { LiquidityConfigurationDialogComponent } from './adjustments/liquidity-configuration-dialog';
import { CoinsDialogComponent, CoinsConfigurationDialogComponent } from './adjustments/coins-dialog';
import { ReversalConfigDialogComponent } from './adjustments/reversal-config-dialog';
import { StrategyFormDialogComponent } from './adjustments/strategy-form-dialog';



@NgModule({
  declarations: [
    AdjustmentsComponent,
    WindowConfigurationDialogComponent,
    KeyzonesConfigFormDialogComponent,
    LiquidityConfigurationDialogComponent,
    CoinsDialogComponent, 
    CoinsConfigurationDialogComponent,
    ReversalConfigDialogComponent,
    StrategyFormDialogComponent,
  ],
  imports: [
    CommonModule,
    AdjustmentsRoutingModule,
    SharedModule
  ]
})
export class AdjustmentsModule { }
