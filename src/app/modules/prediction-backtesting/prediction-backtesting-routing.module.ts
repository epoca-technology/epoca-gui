import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../services';
import { BacktestsComponent } from './backtests/backtests.component';
import { ClassificationTrainingCertificatesComponent } from './classification-training-certificates/classification-training-certificates.component';
import { ClassificationTrainingDataComponent } from './classification-training-data/classification-training-data.component';
import { RegressionTrainingCertificatesComponent } from './regression-training-certificates/regression-training-certificates.component';

const routes: Routes = [
	{
		path: 'backtests',
		component: BacktestsComponent,
		canActivate: [AuthGuard]
	},
	{
		path: 'regressionTrainingCertificates',
		component: RegressionTrainingCertificatesComponent,
		canActivate: [AuthGuard]
	},
	{
		path: 'classificationTrainingData',
		component: ClassificationTrainingDataComponent,
		canActivate: [AuthGuard]
	},
	{
		path: 'classificationTrainingCertificates',
		component: ClassificationTrainingCertificatesComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PredictionBacktestingRoutingModule { }
