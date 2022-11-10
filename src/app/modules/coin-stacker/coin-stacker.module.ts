import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { CoinStackerRoutingModule } from './coin-stacker-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { CoinStackerComponent } from './coin-stacker/coin-stacker.component';


@NgModule({
  declarations: [
    CoinStackerComponent
  ],
  imports: [
    CommonModule,
    CoinStackerRoutingModule,
    SharedModule
  ]
})
export class CoinStackerModule { }
