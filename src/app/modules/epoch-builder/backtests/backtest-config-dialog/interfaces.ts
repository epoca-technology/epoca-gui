import { IBacktestOrder } from "../../../../core";



export interface IBacktestConfigDialogComponent {
    toggleOrder(orderID: IBacktestOrder): void,
    close(limit?: number): void
}




export interface IOrder {
    id: IBacktestOrder,
    name: string,
    description: string,
    icon: string
}



export interface IConfigResponse {
    order: IBacktestOrder,
    limit: number
}