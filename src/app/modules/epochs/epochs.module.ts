import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { EpochsRoutingModule } from './epochs-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { EpochsComponent } from './epochs/epochs.component';
import { InstallEpochComponent } from './epochs/install-epoch';
import { UninstallEpochComponent } from './epochs/uninstall-epoch';


@NgModule({
  declarations: [
    EpochsComponent,
    InstallEpochComponent,
    UninstallEpochComponent
  ],
  imports: [
    CommonModule,
    EpochsRoutingModule,
    SharedModule
  ]
})
export class EpochsModule { }
