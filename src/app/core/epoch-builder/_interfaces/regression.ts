import { 
    IKerasModelConfig, 
    IKerasModelTrainingHistory, 
    IKerasOptimizer, 
    IKerasOptimizerName, 
    IKerasLoss,
    IKerasMetric, 
    IKerasModelSummary
} from "./keras_utils";
import { IDiscovery } from "./discovery";
import { IEpochBuilderEvaluation } from "./epoch_builder_evaluation";






/* Regression Types at types/regression_types.py */







/* Training Data */



/**
 * Regression Dataset Summary
 * This summary is extracted directly from the Dataset
 */
export interface IRegressionDatasetSummary {
    count: number,
    mean: number,
    std: number,
    min: number,
    "25%": number,
    "50%": number,
    "75%": number,
    max: number
}







/* Training Configuration */


/**
 * Regression Training Configuration
 * The configuration that will be used to initialize, train and save the model.
 */
export interface IRegressionTrainingConfig {
    // The ID of the model.
    id: string

    // Any relevant data that should be attached to the trained model.
    description: string

    // The number of prediction candlesticks that will look into the past in order to make a prediction.
    lookback: number

    // The number of predictions to be generated
    predictions: number

    /**
     * The learning rate that will be used to train the model. If the value is equals to -1, the system will
     * use the InverseTimeDecay Class.
     */
    learning_rate: number

    // The optimizer to be used.
    optimizer: IKerasOptimizer

    // The loss function to be used
    loss: IKerasLoss

    // The metric function to be used
    metric: IKerasMetric

    // Keras Model Configuration
    keras_model: IKerasModelConfig
}





/**
 * Regression Training Config Batch
 * Models and created and evaluated in batches. Moreover, multiple batches can be combined
 * in the GUI or can be viewed independently.
 */
export interface IRegressionTrainingConfigBatch {
    // Descriptive name to easily identify the batch. Must be compatible with filesystems.
    name: string,

    // The configurations for the models that will be trained within the batch.
    configs: IRegressionTrainingConfig[]
}






/* Configuration */




/**
 * Regresion Configuration
 * The configuration generated by the model when invoking get_config. This configuration
 * can also be used to initialize a Regression Instance.
 */
export interface IRegressionConfig {
    // The identifier of the model
    id: string,

    // Important information regarding the model
    description: string,

    // The number of candlesticks it will lookback to make a prediction
    lookback: number,

    // The number of predictions it will generate
    predictions: number,

    // The summary of the KerasModel
    summary: IKerasModelSummary
}








/* Training Certificate */





/**
 * Test Dataset Evaluation
 * Once the training is completed, the error is calculated on the test dataset for both, the loss
 * and the metric functions.
 */
export interface ITestDatasetEvaluation {
    mean_absolute_error: number,
    mean_squared_error: number
}






/**
 * Regression Training Certificate
 * Once the training the discovery complete, a certificate containing all the
 * data is saved and returned for batching.
 */
export interface IRegressionTrainingCertificate {
    // Identification
    id: string,
    description: string,

    // Training Data Date Range
    training_data_start: number,    // Open Time of the first prediction candlestick
    training_data_end: number,      // Close Time of the last prediction candlestick

    // Training Data Dataset Sizes
    train_size: number,     // Number of rows in the train dataset
    test_size: number,      // Number of rows in the test dataset

    // Training Data Summary - Description extracted directly from the normalized dataframe
    training_data_summary: IRegressionDatasetSummary,

    // Training Configuration
    learning_rate: number,
    optimizer: IKerasOptimizerName,
    loss: IKerasLoss,
    metric: IKerasMetric,
    keras_model_config: IKerasModelConfig,

    // Training
    training_start: number,     // Time in which the training started
    training_end: number,       // Time in which the training ended

    // Training performance by epoch
    training_history: IKerasModelTrainingHistory,

    // Result of the evaluation of the test dataset
    test_ds_evaluation: ITestDatasetEvaluation,

    // Regression Discovery
    discovery: IDiscovery,

    // The configuration of the Regression
    regression_config: IRegressionConfig,



    /**
     * GUI Properties
     * The following properties only exist in the GUI as they are populated
     * when certificates are loaded.
     */

    // Epoch Builder Evaluation
    ebe: IEpochBuilderEvaluation,

    // The value that will be used to order the certificates
    orderValue: number
}