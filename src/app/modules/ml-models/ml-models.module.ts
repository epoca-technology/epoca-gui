import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { MlModelsRoutingModule } from './ml-models-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { MlModelsComponent } from './ml-models/ml-models.component';


@NgModule({
  declarations: [
    MlModelsComponent
  ],
  imports: [
    CommonModule,
    MlModelsRoutingModule,
    SharedModule
  ]
})
export class MlModelsModule { }
