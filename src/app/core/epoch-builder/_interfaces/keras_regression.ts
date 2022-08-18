import { IDiscoveryPayload } from "./discovery";
import { 
    IKerasModelConfig, 
    IKerasModelTrainingHistory, 
    IKerasOptimizer, 
    IKerasOptimizerName, 
    IKerasRegressionLoss,
    IKerasRegressionMetric
} from "./keras_models";
import { IKerasRegressionConfig } from "./model";
import { IEpochBuilderEvaluation } from "./epoch_builder_evaluation";




/* KerasRegression Types at types/keras_regression_types.py */








/* Regression Training */




/**
 * Keras Regression Training Configuration
 * The configuration that will be used to initialize, train and save the model.
 */
export interface IKerasRegressionTrainingConfig {
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

    /**
     * The learning rate that will be used to train the model. If the value is equals to -1, the system will
     * use the InverseTimeDecay Class.
     */
    learning_rate: number,

    // The optimizer to be used.
    optimizer: IKerasOptimizer,

    // The loss function to be used
    loss: IKerasRegressionLoss,

    // The metric function to be used
    metric: IKerasRegressionMetric,

    // Keras Model Configuration
    keras_model: IKerasModelConfig
}




/**
 * Keras Regression Training Batch
 * Keras Models and created and evaluated in batches. Moreover, multiple batches can be combined
 * in the GUI.
 */
export interface IKerasRegressionTrainingBatch {
	// Descriptive name to easily identify the batch. Must be compatible with filesystems.
	name: string,

	// The configurations for the models that will be trained within the batch.
	models: IKerasRegressionTrainingConfig[]
}






/**
 * Keras Regression Discovery Initialization
 * Once a Keras Model has been trained, it needs to be discovered prior to being evaluated.
 * Therefore, the instance of the KerasRegression must be initialized prior to existing.
 * When providing this configuration, the instance will use it instead of attempting to
 * load the model's file.
 */
export interface IKerasRegressionDiscoveryInitConfig {
    model: any, // Sequential
    autoregressive: boolean
    lookback: number
    predictions: number
}









/**
 * Training Data Summary
 * A summary issued by Pandas regarding the data used to train and evaluate the model.
 */
export interface IKerasRegressionTrainingDataSummaryItem {
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
export interface IKerasRegressionTrainingCertificate {
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
    training_data_summary: IKerasRegressionTrainingDataSummaryItem,


    /* Training Configuration */
    autoregressive: boolean,
    lookback: number,
    predictions: number,
    learning_rate: number,
    optimizer: IKerasOptimizerName,
    loss: IKerasRegressionLoss,
    metric: IKerasRegressionMetric,
    keras_model_config: IKerasModelConfig,


    /* Training */

    // Date Range
    training_start: number,     // Time in which the training started
    training_end: number,       // Time in which the training ended

    // Training performance by epoch
    training_history: IKerasModelTrainingHistory,

    // Result of the evaluation of the test dataset
    test_evaluation: [number, number], // [loss, loss_metric]

    // Regression Discovery
    discovery: IDiscoveryPayload,

    // The configuration of the Regression
    regression_config: IKerasRegressionConfig,


    /**
     * GUI Properties
     * The following properties only exist in the GUI as they are populated
     * when certificates are loaded.
     */

    // This property is populated if the Process Early Stopping was invoked
    early_stopping?: string,

    // Epoch Builder Evaluation
    ebe: IEpochBuilderEvaluation,

    // The value that will be used to order the certificates
    orderValue: number
}