import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


// Routing
import { IpBlacklistRoutingModule } from './ip-blacklist-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { IpBlacklistComponent } from './ip-blacklist/ip-blacklist.component';


@NgModule({
  declarations: [
    IpBlacklistComponent
  ],
  imports: [
    CommonModule,
    IpBlacklistRoutingModule,
    SharedModule
  ]
})
export class IpBlacklistModule { }
