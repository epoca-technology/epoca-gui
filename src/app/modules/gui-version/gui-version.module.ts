import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { GuiVersionRoutingModule } from './gui-version-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { GuiVersionComponent } from './gui-version/gui-version.component';


@NgModule({
  declarations: [
    GuiVersionComponent
  ],
  imports: [
    CommonModule,
    GuiVersionRoutingModule,
    SharedModule
  ]
})
export class GuiVersionModule { }
