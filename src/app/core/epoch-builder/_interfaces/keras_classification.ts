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
import { IEpochBuilderEvaluation } from "./epoch_builder_evaluation";



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