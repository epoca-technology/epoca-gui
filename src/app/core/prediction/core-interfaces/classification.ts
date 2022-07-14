import { 
    IKerasModelConfig, 
    IKerasModelTrainingHistory, 
    IKerasOptimizer,
    IKerasClassificationLoss,
    IKerasClassificationMetric,
    IKerasOptimizerName
} from "./keras-models";
import { IClassificationConfig } from "./model";
import { IModelEvaluation } from "./model-evaluation";



/* Classification Types at types/classification_types.py */








/* Classification Training */





/**
 * Classification Training Configuration
 * The configuration that will be used to initialize, train and save the models.
 */
export interface IClassificationTrainingConfig {
    // The ID of the model. Must be descriptive, compatible with filesystems and preffixed with 'C_'
    id: string,

    // Any relevant data that should be attached to the trained model.
    description: string,

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
 * Classification Training Batch
 * Keras Models and created and evaluated in batches. Moreover, multiple batches can be combined
 * in the GUI
 */
export interface IClassificationTrainingBatch {
    // Descriptive name to easily identify the batch. Must be compatible with filesystems.
    name: string,

    // ID of the Classification Training Data that will be used to train all the models.
    training_data_id: string,

    // The configurations for the models that will be trained within the batch.
    models: IClassificationTrainingConfig[]
}







/**
 * Training Data Summary
 * In order to simplify interactions with the IClassificationTrainingCertificate, the training
 * data is summarized in a dictionary.
 */
export interface ITrainingDataSummary {
    // The ID of the Regression Selection that was used to pick the Regression Models
    regression_selection_id: string,

    // Identifier
    id: string,
    description: string,

    // Date Range
    start: number,    // Open Time of the first prediction candlestick
    end: number,      // Close Time of the last prediction candlestick

    // Dataset Sizes
    train_size: number,     // Number of rows in the train dataset
    test_size: number,      // Number of rows in the test dataset

    /**
     * The Prediction Candlestick steps that will be used to generate the data. If 0 is provided
     * the training data will be generated the traditional way.
     * The purpose of this mode is to increase the size of the Training Dataset and cover more 
     * cases.
     */
    steps: number,

    // Percentages that determine if the price moved up or down
    up_percent_change: number,
    down_percent_change: number,

    // Optional Technical Analysis Features
    include_rsi: boolean,       // Momentum
    include_stoch: boolean,     // Momentum
    include_aroon: boolean,     // Trend
    include_stc: boolean,       // Trend
    include_mfi: boolean,       // Volume

    // The total number of features that will be used by the model to predict
    features_num: number
}












/**
 * Classification Training Certificate
 * Once the training, saving and evaluation completes, a certificate containing all the
 * data is saved and issued for batching.
 */
export interface IClassificationTrainingCertificate {
    /* Identification */
    id: string,
    description: string,


    /* Training Data */
    training_data_summary: ITrainingDataSummary,



    /* Training Configuration */
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

    // Classification Post-Training Evaluation
    classification_evaluation: IModelEvaluation,

    // The configuration of the Classification
    classification_config: IClassificationConfig,


    /* General Evaluation */
    general: IGeneralEvaluation // Only exists in the GUI
}











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