import { IClassificationCertificatesOrder } from "../../../../core";



export interface IClassificationTrainingCertificatesConfigDialogComponent {
    toggleOrder(orderID: IClassificationCertificatesOrder): void,
    close(limit?: number): void
}




export interface IOrder {
    id: IClassificationCertificatesOrder,
    name: string,
    description: string,
    icon: string
}



export interface IConfigResponse {
    order: IClassificationCertificatesOrder,
    limit: number
}