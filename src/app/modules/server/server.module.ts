import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { ServerRoutingModule } from './server-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { ServerComponent } from './server/server.component';
import { AlarmsConfigDialogComponent } from './server/alarms-config-dialog/alarms-config-dialog.component';


@NgModule({
  declarations: [
    ServerComponent,
    AlarmsConfigDialogComponent
  ],
  imports: [
    CommonModule,
    ServerRoutingModule,
    SharedModule
  ]
})
export class ServerModule { }
