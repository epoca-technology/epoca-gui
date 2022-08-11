import { IDiscoveryPayload } from "./discovery";
import { IXGBRegressionConfig } from "./model";
import { IModelEvaluation } from "./model_evaluation";




/* XGBRegression Types at types/xgb_regression_types.py */








/* Regression Training */




/**
 * XGBoost Regression Training Configuration
 * The configuration that will be used to initialize, train and save the model.
 */
export interface IXGBRegressionTrainingConfig {
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

    // @TODO
}






/**
 * XGBoost Regression Training Batch
 * XGBoost Models and created and evaluated in batches. Moreover, multiple batches can be combined
 * in the GUI.
 */
export interface IXGBRegressionTrainingBatch {
	// Descriptive name to easily identify the batch. Must be compatible with filesystems.
	name: string,

	// The configurations for the models that will be trained within the batch.
	models: IXGBRegressionTrainingConfig[]
}






/**
 * XGB Regression Discovery Initialization
 * Once a XGBoost Model has been trained, it needs to be discovered prior to being evaluated.
 * Therefore, the instance of the XGBRegression must be initialized prior to existing.
 * When providing this configuration, the instance will use it instead of attempting to
 * load the model's file.
 */
export interface IXGBRegressionDiscoveryInitConfig {
    model: any, // 
    autoregressive: boolean
    lookback: number
    predictions: number
}









/**
 * Training Data Summary
 * A summary issued by Pandas regarding the data used to train and evaluate the model.
 */
export interface IXGBRegressionTrainingDataSummaryItem {
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
export interface IXGBRegressionTrainingCertificate {
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
    training_data_summary: IXGBRegressionTrainingDataSummaryItem,


    /* Training Configuration */
    autoregressive: boolean,
    lookback: number,
    predictions: number,
    // @TODO


    /* Training */

    // Date Range
    training_start: number,     // Time in which the training started
    training_end: number,       // Time in which the training ended

    // Training performance by epoch
    // @TODO

    // Result of the evaluation of the test dataset
    // @TODO

    // Regression Discovery
    discovery: IDiscoveryPayload,

    // Regression Post-Training Evaluation
    regression_evaluation: IModelEvaluation,

    // The configuration of the Regression
    regression_config: IXGBRegressionConfig,


    /* General Evaluation - @TODO: PENDING UPGRADE */
    general: any // Only exists in the GUI
}