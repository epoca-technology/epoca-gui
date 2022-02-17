import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { SettingsRoutingModule } from './settings-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { SettingsComponent } from './settings/settings.component';


@NgModule({
  declarations: [
    SettingsComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule
  ]
})
export class SettingsModule { }
