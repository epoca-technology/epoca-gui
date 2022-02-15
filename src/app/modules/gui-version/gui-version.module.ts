import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuiVersionRoutingModule } from './gui-version-routing.module';
import { GuiVersionComponent } from './gui-version/gui-version.component';


@NgModule({
  declarations: [
    GuiVersionComponent
  ],
  imports: [
    CommonModule,
    GuiVersionRoutingModule
  ]
})
export class GuiVersionModule { }
