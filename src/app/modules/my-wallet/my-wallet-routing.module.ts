import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../services";
import { MyWalletComponent } from "./my-wallet/my-wallet.component";

const routes: Routes = [
  {
		path: "",
		component: MyWalletComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyWalletRoutingModule { }
