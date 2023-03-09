import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

// Routing
import { OrderBookRoutingModule } from "./order-book-routing.module";

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { OrderBookComponent } from "./order-book/order-book.component";


@NgModule({
  declarations: [
    OrderBookComponent
  ],
  imports: [
    CommonModule,
    OrderBookRoutingModule,
    SharedModule
  ]
})
export class OrderBookModule { }
