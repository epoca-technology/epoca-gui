import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { MyWalletRoutingModule } from './my-wallet-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { MyWalletComponent } from './my-wallet/my-wallet.component';

@NgModule({
  declarations: [MyWalletComponent],
  imports: [
    CommonModule,
    MyWalletRoutingModule,
    SharedModule
  ]
})
export class MyWalletModule { }
