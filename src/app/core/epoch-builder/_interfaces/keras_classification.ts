import { 
    IKerasModelConfig, 
    IKerasModelTrainingHistory, 
    IKerasOptimizer,
    IKerasClassificationLoss,
    IKerasClassificationMetric,
    IKerasOptimizerName
} from "./keras_models";
import { IClassificationConfig, IModel } from "./model";
import { ITrainingDataSummary } from "./classification_training_data";
import { IModelEvaluation } from "./model_evaluation";
import { IDiscoveryPayload } from "./discovery";



/* Keras Classification Types at types/keras_classification_types.py */








/* Classification Training */





/**
 * Keras Classification Training Configuration
 * The configuration that will be used to initialize, train and save the models.
 */
export interface IKerasClassificationTrainingConfig {
    // The ID of the model.
    id: string,

    // Any relevant data that should be attached to the trained model.
    description: string,

    /**
     * The learning rate that will be used to train the model. If the value is equals to -1, the system will
     * use the InverseTimeDecay Class.
     */
    learning_rate: number,

    // The optimizer to be used.
    optimizer: IKerasOptimizer,

    // The loss function to be used
    loss: IKerasClassificationLoss,

    // The metric to be used for meassuring the val_loss
    metric: IKerasClassificationMetric,

    // Keras Model Configuration
    keras_model: IKerasModelConfig
}







/**
 * Keras Classification Training Batch
 * Keras Models and created and evaluated in batches. Moreover, multiple batches can be combined
 * in the GUI
 */
export interface IKerasClassificationTrainingBatch {
    // Descriptive name to easily identify the batch. Must be compatible with filesystems.
    name: string,

    // ID of the Classification Training Data that will be used to train all the models.
    training_data_id: string,

    // The configurations for the models that will be trained within the batch.
    models: IKerasClassificationTrainingConfig[]
}






/**
 * Keras Classification Discovery Initialization
 * Once a Keras Model has been trained, it needs to be discovered prior to being evaluated.
 * Therefore, the instance of the KerasClassification must be initialized prior to existing.
 * When providing this configuration, the instance will use it instead of attempting to
 * load the model's file
 */
export interface IKerasClassificationDiscoveryInitConfig {
    model: any, // Sequential
    training_data_id: string,
    include_rsi: boolean,
    include_aroon: boolean,
    features_num: number
    regressions: IModel[],
    price_change_requirement: number
}









/**
 * Classification Training Certificate
 * Once the training, saving and evaluation completes, a certificate containing all the
 * data is saved and issued for batching.
 */
export interface IKerasClassificationTrainingCertificate {
    /* Identification */
    id: string,
    description: string,

    /* Training Data */
    training_data_summary: ITrainingDataSummary,


    /* Training Configuration */
    learning_rate: number,
    optimizer: IKerasOptimizerName,
    loss: IKerasClassificationLoss,
    metric: IKerasClassificationMetric,
    keras_model_config: IKerasModelConfig,


    /* Training */

    // Date Range
    training_start: number,     // Time in which the training started
    training_end: number,       // Time in which the training ended

    // Training performance by epoch
    training_history: IKerasModelTrainingHistory,

    // Result of the evaluation of the test dataset
    test_evaluation: [number, number], // [loss, metric]

    // Classification Discovery
    discovery: IDiscoveryPayload

    // Classification Post-Training Evaluation
    classification_evaluation: IModelEvaluation,

    // The configuration of the Classification
    classification_config: IClassificationConfig,


    /* General Evaluation - UPGRADE @TODO */
    general: any // Only exists in the GUI
}








/* DEPRECATE GENERAL EVALUATION FROM THIS MODULE */


/* General Evaluation */



export type IGeneralEvaluationStateClass = "error"|"warning"|"neutral"|"decent"|"optimal";



/**
 * General Evaluation (GUI)
 * This evaluation is performed on each certificate when they are extracted 
 * from the JSON files.
 */
export interface IGeneralEvaluation {
    // Total points collected by all the items and categories
    points: number,

    // The maximum number of points that can be collected within the evaluation
    max_points: number,

    // State Class
    state_class: IGeneralEvaluationStateClass,
    
    // List of categories
    categories: IGeneralEvaluationCategory[]
}



export interface IGeneralEvaluationCategory {
    // The name of the category
    name: string,

    // The description of the category
    description: string,

    // Total points collected within the category
    points: number,

    // The maximum number of points that can be collected within the category
    max_points: number,

    // State Class
    state_class: IGeneralEvaluationStateClass,

    // Category Items
    items: IGeneralEvaluationItem[]
}


export interface IGeneralEvaluationItem {
    // The identifier of the item
    id: IGeneralEvaluationItemID,

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
    state_class: IGeneralEvaluationStateClass,
}


export type IGeneralEvaluationItemID = 
// Training
"loss_improvement"|
"val_loss_improvement"|
"loss_vs_val_loss"|
"accuracy_improvement"|
"val_accuracy_improvement"|
"accuracy_vs_val_accuracy"|

// Test Dataset Evaluation
"test_ds_accuracy"|

// Classification Evaluation
"points_median"|
"long_accuracy"|
"short_accuracy"|
"general_accuracy"|
"prediction_neutrality"|
"long_prediction_balance"|
"short_prediction_balance";




export interface IItemGeneralEvaluation {
    points: number,
    state: string,
    state_class: IGeneralEvaluationStateClass
}