import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { TransactionsRoutingModule } from './transactions-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { TransactionsComponent } from './transactions/transactions.component';
import { TransactionListDialogComponent } from './transactions/transaction-list-dialog/transaction-list-dialog.component';



@NgModule({
  declarations: [
    TransactionsComponent,
    TransactionListDialogComponent
  ],
  imports: [
    CommonModule,
    TransactionsRoutingModule,
    SharedModule
  ]
})
export class TransactionsModule { }
