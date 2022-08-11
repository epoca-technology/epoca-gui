import { ITrainingDataSummary } from "./classification_training_data";
import { IDiscoveryPayload } from "./discovery";
import { IXGBClassificationConfig } from "./model";
import { IModelEvaluation } from "./model_evaluation";



/* XGBClassification Types at types/xgb_classification_types.py */








/* Classification Training */





/**
 * XGBoost Classification Training Configuration
 * The configuration that will be used to initialize, train and save the models.
 */
export interface IXGBClassificationTrainingConfig {
    // The ID of the model. Must be descriptive, compatible with filesystems and preffixed with 'C_'
    id: string,

    // Any relevant data that should be attached to the trained model.
    description: string,

    // @TODO
}







/**
 * XGBoost Classification Training Batch
 * XGB Models and created and evaluated in batches. Moreover, multiple batches can be combined
 * in the GUI
 */
export interface IXGBClassificationTrainingBatch {
    // Descriptive name to easily identify the batch. Must be compatible with filesystems.
    name: string,

    // ID of the Classification Training Data that will be used to train all the models.
    training_data_id: string,

    // The configurations for the models that will be trained within the batch.
    models: IXGBClassificationTrainingConfig[]
}












/**
 * Classification Training Certificate
 * Once the training, saving and evaluation completes, a certificate containing all the
 * data is saved and issued for batching.
 */
export interface IXGBClassificationTrainingCertificate {
    /* Identification */
    id: string,
    description: string,


    /* Training Data */
    training_data_summary: ITrainingDataSummary,



    /* Training Configuration */
    // @TODO


    /* Training */

    // Date Range
    training_start: number,     // Time in which the training started
    training_end: number,       // Time in which the training ended

    // Training performance by epoch
    // @TODO

    // Result of the evaluation of the test dataset
    // @TODO

    // Classification Discovery
    discovery: IDiscoveryPayload,

    // Classification Post-Training Evaluation
    classification_evaluation: IModelEvaluation,

    // The configuration of the Classification
    classification_config: IXGBClassificationConfig,


    /* General Evaluation */
    general: any // Only exists in the GUI
}