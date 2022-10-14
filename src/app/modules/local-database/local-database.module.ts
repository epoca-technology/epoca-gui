import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { LocalDatabaseRoutingModule } from './local-database-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { LocalDatabaseComponent } from './local-database/local-database.component';


@NgModule({
  declarations: [
    LocalDatabaseComponent
  ],
  imports: [
    CommonModule,
    LocalDatabaseRoutingModule,
    SharedModule
  ]
})
export class LocalDatabaseModule { }
