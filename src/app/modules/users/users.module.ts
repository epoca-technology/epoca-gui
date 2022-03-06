import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { UsersRoutingModule } from './users-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { UsersComponent } from './users/users.component';


@NgModule({
  declarations: [
    UsersComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    SharedModule
  ]
})
export class UsersModule { }
