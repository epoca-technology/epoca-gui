import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { DatabaseRoutingModule } from './database-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { DatabaseComponent } from './database/database.component';


@NgModule({
  declarations: [
    DatabaseComponent
  ],
  imports: [
    CommonModule,
    DatabaseRoutingModule,
    SharedModule
  ]
})
export class DatabaseModule { }
