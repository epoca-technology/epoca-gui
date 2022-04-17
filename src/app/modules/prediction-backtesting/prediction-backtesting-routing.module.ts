import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../services';
import { PredictionBacktestingComponent } from './prediction-backtesting/prediction-backtesting.component';

const routes: Routes = [
	{
	path: '',
	component: PredictionBacktestingComponent,
	canActivate: [AuthGuard]
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PredictionBacktestingRoutingModule { }
