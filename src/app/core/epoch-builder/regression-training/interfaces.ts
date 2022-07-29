import { IGeneralRegressionEvaluation, IRegressionTrainingCertificate } from "../../prediction";



export interface IRegressionTrainingService {
    init(event: any|string, order: IRegressionCertificatesOrder, limit: number): Promise<void>
}




export interface IRegressionTrainingEvaluationService {
    buildGeneralEvaluation(cert: IRegressionTrainingCertificate): IGeneralRegressionEvaluation
}








/**
 * Order Types
 * Trained models arent easy to evaluate as there are many factors that 
 * could determine their efficiency and therefore, when making decisions, 
 * trained models should be visualized with all 3 orders.
 * 1) general_points: certificates are ordered by the points received during
 * the general evaluation.
 * 2) reg_eval_points: certificates are ordered by the points obtained during the 
 * classification evaluation.
 */
 export type IRegressionCertificatesOrder = "general_points"|"reg_eval_points";
