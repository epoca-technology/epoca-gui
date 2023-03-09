import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../services";
import { OrderBookComponent } from "./order-book/order-book.component";

const routes: Routes = [
  	{
		path: "",
		component: OrderBookComponent,
		canActivate: [AuthGuard]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderBookRoutingModule { }
