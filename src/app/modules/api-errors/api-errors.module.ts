import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { ApiErrorsRoutingModule } from './api-errors-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { ApiErrorsComponent } from './api-errors/api-errors.component';


@NgModule({
  declarations: [
    ApiErrorsComponent
  ],
  imports: [
    CommonModule,
    ApiErrorsRoutingModule,
    SharedModule
  ]
})
export class ApiErrorsModule { }
