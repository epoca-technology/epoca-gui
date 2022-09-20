


/* Evaluation Result */


/**
 * Epoch Builder Evaluation
 * This evaluation is performed based on the raw results coming from the
 * Epoch Builder. Even though this should not be the only evaluation
 * to take into consideration, it should be the most important one.
 * 
 * It is also important to note that an evaluation can contain any number
 * of categories and items.
 */
export interface IEpochBuilderEvaluation {
    // Total points collected by all the items and categories
    points: number,

    // The maximum number of points that can be collected within the evaluation
    max_points: number,

    // State Class
    state_class: IEpochBuilderEvaluationStateClass,
    
    // List of categories
    categories: IEpochBuilderEvaluationCategory[]
}




// Evaluation Category
export interface IEpochBuilderEvaluationCategory {
    // The name of the category
    name: string,

    // The description of the category
    description: string,

    // Total points collected within the category
    points: number,

    // The maximum number of points that can be collected within the category
    max_points: number,

    // State Class
    state_class: IEpochBuilderEvaluationStateClass,

    // Category Items
    items: IEpochBuilderEvaluationItem[]
}




// Evaluation Item
export interface IEpochBuilderEvaluationItem {
    // The name of the item
    name: string,

    // A brief description of what the evaluation does
    description: string,

    // A brief description of the item's state
    state: string,

    // Total points collected by the item
    points: number,

    // The maximum number of points that can be collected within the category
    max_points: number,

    // State Class
    state_class: IEpochBuilderEvaluationStateClass,
}







/* Evaluation System */





/**
 * Category Config
 * An evaluation is performed with a list of category configs. Note that the 
 * results will be returned in the same order.
 */
export interface IEpochBuilderEvaluationCategoryConfig {
    // The name of the category
    name: string,

    // The description of the category
    description: string,

    // The list of items that will be evaluated
    items: IEpochBuilderEvaluationItemConfig[]
}




/**
 * Item Config
 * A Category is comprised by any number of items. These are evaluated and their
 * score affect the category and the general evaluatino.
 */
export interface IEpochBuilderEvaluationItemConfig {
    // The name of the item
    name: string,

    // A brief description of what the evaluation does
    description: string,

    // The name of the evaluation function to be used
    evaluationFunction: IEpochBuilderEvaluationFunction,

    // The parameters object
    evaluationParams: IEpochBuilderEvaluationFunctionParams
}




// The evaluation functions supported by the system. These must be accompanied by the params object.
export type IEpochBuilderEvaluationFunction = 
"evaluateLossImprovement"|
"evaluateLossVsValLoss"|
"evaluateTestDatasetLoss"|
"evaluatePoints"|
"evaluateAccuracy"|
"evaluatePredictionsVsOutcomes";



// Parameters used to evaluate each item
export interface IEpochBuilderEvaluationFunctionParams {
    // Mandatory property
    maxPoints: number,

    // evaluateLossImprovement
    firstLoss?: number,
    lastLoss?: number,

    // evaluateLossVsValLoss
    finalLoss?: number,
    finalValLoss?: number,

    // evaluateTestDatasetLoss
    meanAbsoluteError?: number,
    meanSquaredError?: number,

    // evaluatePoints
    receivedPoints?: number,
    maxReceivablePoints?: number,

    // evaluateAccuracy
    accuracy?: number,

    // evaluatePredictionsVsOutcomes
    predictions?: number,
    outcomes?: number
}



// The result of an item evaluation
export interface IEpochBuilderEvaluationItemResult {
    points: number,
    state: string,
    state_class: IEpochBuilderEvaluationStateClass
}





// The CSS Class that represents the state of an item, category or the evaluation itself
export type IEpochBuilderEvaluationStateClass = "ebe-error"|"ebe-warning"|"ebe-neutral"|"ebe-decent"|"ebe-optimal";




// Evaluation Descriptions
export interface IEpochBuilderEvaluationDescriptions {
    lossImprovement: string,
    lossVsValLoss: string,
    testDatasetLoss: string,
    accuracy: string,
    points: string,
    predictionsVsOutcomes: string
}