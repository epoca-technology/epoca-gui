import { IClassificationTrainingCertificate, IGeneralEvaluation } from "../../prediction";



export interface IClassificationTrainingService {
    init(event: any|string, order: IClassificationCertificatesOrder, limit: number): Promise<void>
}



export interface IClassificationTrainingEvaluationService {
    buildGeneralEvaluation(cert: IClassificationTrainingCertificate): IGeneralEvaluation
}





export interface IEvaluation {
    loss: number,
    accuracy: number
}




export interface IMetadataItem {
    index: number,
    id: string,
    value: number
}




/**
 * Order Types
 * Trained models arent easy to evaluate as there are many factors that 
 * could determine their efficiency and therefore, when making decisions, 
 * trained models should be visualized with all 3 orders.
 * 1) general_points: certificates are ordered by the points received during
 * the general evaluation.
 * 2) class_eval_acc: certificates are ordered by the general accuracy received in the
 * classification evaluation.
 * 3) class_eval_points: certificates are ordered by the points obtained during the 
 * classification evaluation.
 * 4) test_ds_acc: certificates are ordered by the accuracy received when 
 * evaluating the test dataset.
 */
 export type IClassificationCertificatesOrder = "general_points"|"class_eval_acc"|"class_eval_points"|"test_ds_acc";




