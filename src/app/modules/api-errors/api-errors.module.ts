import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiErrorsRoutingModule } from './api-errors-routing.module';
import { ApiErrorsComponent } from './api-errors/api-errors.component';


@NgModule({
  declarations: [
    ApiErrorsComponent
  ],
  imports: [
    CommonModule,
    ApiErrorsRoutingModule
  ]
})
export class ApiErrorsModule { }
