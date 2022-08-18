import { IEpochBuilderEvaluation, IEpochBuilderEvaluationCategoryConfig, IEpochBuilderEvaluationDescriptions } from "../_interfaces";



// Service
export interface IEpochBuilderEvaluationService {
    // Properties
    desc: IEpochBuilderEvaluationDescriptions,

    // Methods
    evaluate(categoryConfigs: IEpochBuilderEvaluationCategoryConfig[]): IEpochBuilderEvaluation
}