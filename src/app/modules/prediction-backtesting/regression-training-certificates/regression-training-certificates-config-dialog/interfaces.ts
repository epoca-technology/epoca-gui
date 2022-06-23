import { IRegressionCertificatesOrder } from "../../../../core";



export interface IRegressionTrainingCertificatesConfigDialogComponent {
    toggleOrder(orderID: IRegressionCertificatesOrder): void,
    close(limit?: number): void
}




export interface IOrder {
    id: IRegressionCertificatesOrder,
    name: string,
    description: string,
    icon: string
}



export interface IConfigResponse {
    order: IRegressionCertificatesOrder,
    limit: number
}