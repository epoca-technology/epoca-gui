import { IGeneralEvaluationItem, IGeneralEvaluationStateClass } from "./classification";
import { IKerasModelConfig, IKerasModelTrainingHistory, IKerasOptimizer, IKerasOptimizerName, IKerasRegressionLoss } from "./keras-models";
import { IRegressionConfig } from "./model";
import { IModelEvaluation } from "./model-evaluation";



/* Regression Types at types/regression_types.py */








/* Regression Training */




/**
 * Regression Training Configuration
 * The configuration that will be used to initialize, train and save the model.
 */
export interface IRegressionTrainingConfig {
	// The ID of the model. Must be descriptive, compatible with filesystems and preffixed with 'R_'
    id: string,

    // Any relevant data that should be attached to the trained model.
    description: string,

    /**
     * Regression Model Type
     * Default: will generate all predictions in one go.
     * Autoregressive: will generate 1 prediction at a time and feed it to itself as an input 
     */
    autoregressive: boolean,

    // The number of prediction candlesticks that will look into the past in order to make a prediction.
    lookback: number,

    // The number of predictions to be generated
    predictions: number,

    // The optimizer to be used.
    optimizer: IKerasOptimizer,

    // The loss function to be used
    loss: IKerasRegressionLoss,

    // Keras Model Configuration
    keras_model: IKerasModelConfig
}




/**
 * Regression Training Batch
 * Keras Models and created and evaluated in batches. Moreover, multiple batches can be combined
 * in the GUI.
 */
export interface IRegressionTrainingBatch {
	// Descriptive name to easily identify the batch. Must be compatible with filesystems.
	name: string,

	// The configurations for the models that will be trained within the batch.
	models: IRegressionTrainingConfig[]
}










/**
 * Training Data Summary
 * A summary issued by Pandas regarding the data used to train and evaluate the model.
 */
export interface IRegressionTrainingDataSummaryItem {
	"count": number,
	"mean": number,
	"std": number,
	"min": number,
	"25%": number,
	"50%": number,
	"75%": number,
	"max": number
}





/**
 * Regression Training Certificate
 * Once the training, saving and evaluation completes, a certificate containing all the
 * data is saved and issued for batching.
 */
export interface IRegressionTrainingCertificate {
    /* Identification */
    id: string,
    description: string,


    /* Training Data */

    // Date Range
    training_data_start: number,    // Open Time of the first prediction candlestick
    training_data_end: number,      // Close Time of the last prediction candlestick

    // Dataset Sizes
    train_size: number,     // Number of rows in the train dataset
    test_size: number,      // Number of rows in the test dataset

    // Data Summary - Description extracted directly from the normalized dataframe
    training_data_summary: IRegressionTrainingDataSummaryItem,


    /* Training Configuration */
    autoregressive: boolean,
    lookback: number,
    predictions: number,
    optimizer: IKerasOptimizerName,
    loss: IKerasRegressionLoss,
    keras_model_config: IKerasModelConfig,


    /* Training */

    // Date Range
    training_start: number,     // Time in which the training started
    training_end: number,       // Time in which the training ended

    // Training performance by epoch
    training_history: IKerasModelTrainingHistory,

    // Result of the evaluation of the test dataset
    test_evaluation: number, // loss

    // Regression Post-Training Evaluation
    regression_evaluation: IModelEvaluation,

    // The configuration of the Regression
    regression_config: IRegressionConfig,


    /* General Evaluation */
    general: IGeneralRegressionEvaluation // Only exists in the GUI
}










/* General Evaluation */




/**
 * General Evaluation (GUI)
 * This evaluation is performed on each certificate when they are extracted 
 * from the JSON files.
 */
 export interface IGeneralRegressionEvaluation {
    // Total points collected by all the items and categories
    points: number,

    // The maximum number of points that can be collected within the evaluation
    max_points: number,

    // State Class
    state_class: IGeneralEvaluationStateClass,
    
    // List of items
    items: IGeneralEvaluationItem[]
}