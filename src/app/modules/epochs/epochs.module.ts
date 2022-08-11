import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { EpochsRoutingModule } from './epochs-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { EpochsComponent } from './epochs/epochs.component';


@NgModule({
  declarations: [
    EpochsComponent
  ],
  imports: [
    CommonModule,
    EpochsRoutingModule,
    SharedModule
  ]
})
export class EpochsModule { }
