import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MlModelsRoutingModule } from './ml-models-routing.module';
import { MlModelsComponent } from './ml-models/ml-models.component';


@NgModule({
  declarations: [
    MlModelsComponent
  ],
  imports: [
    CommonModule,
    MlModelsRoutingModule
  ]
})
export class MlModelsModule { }
