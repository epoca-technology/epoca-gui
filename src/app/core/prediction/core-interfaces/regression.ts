import { IKerasModelConfig, IKerasModelTrainingHistory } from "./keras-models";
import { IRegressionConfig } from "./model";



/* Regression Types at regression/types.py */








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

    // The number of prediction candlesticks that will look into the past in order to make a prediction.
    lookback: number,

    // The number of predictions to be generated
    predictions: number,

    // The learning rate to be used by the optimizer
    learning_rate: number,

    // The optimizer to be used.
    optimizer: string, // 'adam'|'rmsprop'

    // The loss function to be used
    loss: string, // 'mse'|'mae'

    // The metric to be used for meassuring the val_loss
    metric: string, // 'mse'|'mae'

    // Batch Size
    batch_size: number,

    // Train Data Shuffling
    shuffle_data: boolean,

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

    // Start and end time - If none provided, will use all the available data
    start: string|number|null,
    end: string|number|null,

	// The configurations for the models that will be trained within the batch.
	models: IRegressionTrainingConfig[]
}






/**
 * Regression Evaluation
 * Evaluation performed right after the model is trained in order to get an overview of the
 * potential accuracy, as well as the prediction type distribution.
 * Each evaluation is performed using a random candlestick open time and is evaluated against
 * the candlestick placed at the end of the window based on the model's predictions config.
 */
export interface IRegressionEvaluation {
    // The number of evaluations performed on the Regression
    evaluations: number,
    max_evaluations: number,

    // The number of times the Regression predicted a price increase
    increase_num: number,
    increase_successful_num: number,

    // The number of times the Regression predicted a price decrease
    decrease_num: number,
    decrease_successful_num: number,

    // Accuracy
    increase_acc: number,
    decrease_acc: number,
    acc: number,

    // Increase Predictions Overview
    increase_max: number,
    increase_min: number,
    increase_mean: number,
    increase_successful_max: number,
    increase_successful_min: number,
    increase_successful_mean: number,

    // Decrease Predictions Overview
    decrease_max: number,
    decrease_min: number,
    decrease_mean: number,
    decrease_successful_max: number,
    decrease_successful_min: number,
    decrease_successful_mean: number
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
export interface IRegressionTrainingDataSummary {
	o: IRegressionTrainingDataSummaryItem,	// Open Price
	h: IRegressionTrainingDataSummaryItem,	// Highest Price
	l: IRegressionTrainingDataSummaryItem,	// Lowest Price
	c: IRegressionTrainingDataSummaryItem,	// Close Price
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
    val_size: number,       // Number of rows in the val dataset
    test_size: number,      // Number of rows in the test dataset

    // Data Summary - Description extracted directly from the normalized dataframe
    training_data_summary: IRegressionTrainingDataSummary,


    /* Training Configuration */
    lookback: number,
    predictions: number,
    learning_rate: number,
    optimizer: string,
    loss: string,
    metric: string,
    batch_size: number,
    shuffle_data: boolean,
    keras_model_config: IKerasModelConfig,


    /* Training */

    // Date Range
    training_start: number,     // Time in which the training started
    training_end: number,       // Time in which the training ended

    // Training performance by epoch
    training_history: IKerasModelTrainingHistory,

    // Result of the evaluation of the test dataset
    test_evaluation: [number, number], // [loss, metric]

    // Regression Post-Training Evaluation
    regression_evaluation: IRegressionEvaluation,

    // The configuration of the Regression
    regression_config: IRegressionConfig
}