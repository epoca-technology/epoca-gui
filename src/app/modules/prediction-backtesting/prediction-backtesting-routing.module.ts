import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../services';
import { BacktestsComponent } from './backtests/backtests.component';
import { ModelsTrainingComponent } from './models-training/models-training.component';
import { TrainingDataComponent } from './training-data/training-data.component';

const routes: Routes = [
	{
		path: 'backtests',
		component: BacktestsComponent,
		canActivate: [AuthGuard]
	},
	{
		path: 'trainingData',
		component: TrainingDataComponent,
		canActivate: [AuthGuard]
	},
	{
		path: 'modelsTraining',
		component: ModelsTrainingComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PredictionBacktestingRoutingModule { }
