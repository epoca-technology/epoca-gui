import { IKerasModelSummary } from "./keras_models";
import { IXGBModelSummary } from "./xgb_models";
import { IDiscovery } from "./discovery";
import { IPercentChangeInterpreterConfig, IProbabilityInterpreterConfig, IConsensusInterpreterConfig } from "./interpreter";






/* Model Types at types/model_types.py */






/* Model Type Names */



// Types of models supported by the project
export type IModelType =     
"KerasRegressionModel"|         // KR_
"KerasClassificationModel"|     // KC_
"XGBRegressionModel"|           // XGBR_
"XGBClassificationModel"|       // XGBC_
"ConsensusModel"                // CON_





// Trainable Model Types
export type ITrainableModelType = 
"keras_regression"|         // KerasRegressionModel
"keras_classification"|     // KerasClassificationModel
"xgb_regression"|           // XGBRegressionModel
"xgb_classification";       // XGBClassificationModel




// Model ID Prefix
export type IModelIDPrefix = 
"KR_"|      // KerasRegressionModel
"KC_"|      // KerasClassificationModel
"XGBR_"|   // XGBRegressionModel
"XGBC_"|   // XGBClassificationModel
"CON_";    // ConsensusModel













 /* Regression Configurations */
 

 
/**
* Regresion Configuration
* The general configuration that should be followed by regressions.
*/
export interface IRegressionConfig {
	// The identifier of the model
	id: string,

	// Important information regarding the trained model
    description: string,

    /**
     * Regression Model Type
     * Default: will generate all predictions in one go.
     * Autoregressive: will generate 1 prediction at a time and feed it to itself as an input 
     */
    autoregressive: boolean,

    // The number of candlesticks it will lookback to make a prediction
    lookback: number,

    // The number of predictions it will generate
    predictions: number

    // The discovery performed prior to saving the model
    discovery: IDiscovery
}



/**
 * Keras Regresion Configuration
 * The configuration that was used to train and will predict based on.
 */
export interface IKerasRegressionConfig extends IRegressionConfig {
    // The summary of the KerasModel
    summary: IKerasModelSummary
}



/**
 * XGBoost Regresion Configuration
 * The configuration that was used to train and will predict based on.
 */
 export interface IXGBRegressionConfig extends IRegressionConfig {
    // The summary of the XGBModel
    summary: IXGBModelSummary
}






/* Classification Configurations */

 
 

/**
* Classification Configuration
* The configuration that was used to train and will predict based on.
*/
export interface IClassificationConfig {
    // The identifier of the model
    id: string,

    // Important information regarding the trained model
    description: string,

    // The identifier of the training data used
    training_data_id: string,

    // The list of ArimaModel|RegressionModel attached to the classification
    regressions: IModel[]

    // Optional Technical Analysis Features
    include_rsi: boolean,       // Momentum
    include_aroon: boolean,     // Trend

    // The total number of features that will be used by the model to predict
    features_num: number,

    // The percentage the price needs to change in order to be considered up or down
    price_change_requirement: number,

    // The discovery performed prior to saving the model
    discovery: IDiscovery
}




/**
 * Keras Classification Configuration
 * The configuration that was used to train and will predict based on.
 */
export interface IKerasClassificationConfig extends IClassificationConfig {
    // The summary of the KerasModel
    summary: IKerasModelSummary
}



/**
 * XGBoost Classification Configuration
 * The configuration that was used to train and will predict based on.
 */
export interface IXGBClassificationConfig extends IClassificationConfig {
    // The summary of the KerasModel
    summary: IXGBModelSummary
}







 
 
 
 
 /* RegressionModel Configurations */
 
 


 
 /**
  * RegressionModel Configuration
  * The general configuration that should be followed by regression models.
  */
 export interface IRegressionModelConfig {
    // The ID of the saved keras regression model
    regression_id: string,
 
    // The interpreter that will determine the prediction's result
    interpreter: IPercentChangeInterpreterConfig,
 }
 

 /**
  * KerasRegressionModel Configuration
  * The configuration used by the Keras Regression. Only exists when the model is initialized.
  */
 export interface IKerasRegressionModelConfig extends IRegressionModelConfig {
    regression: IKerasRegressionConfig
 }


/**
 * XGBRegressionModel Configuration
 * The configuration used by the XGBoost Regression. Only exists when the model is initialized.
 */
export interface IXGBRegressionModelConfig extends IRegressionModelConfig {
    regression: IXGBRegressionConfig
 }


 


 /* ClassificationModel Configurations */

 
 
/**
 * ClassificationModel Configuration
 * The general configuration that should be followed by classification models.
 */
export interface IClassificationModelConfig {
    // The ID of the saved keras classification model
    classification_id: string,

    // The interpreter that will determine the prediction's result
    interpreter: IProbabilityInterpreterConfig
}
 


/**
 * KerasClassificationModel Configuration
 * The configuration used by the Keras Classification. Only exists when the model is initialized.
 */
export interface IKerasClassificationModelConfig extends IClassificationModelConfig {
    classification: IKerasClassificationConfig
}


/**
 * XGBClassificationModel Configuration
 * The configuration used by the XGBoost Classification. Only exists when the model is initialized.
 */
export interface IXGBClassificationModelConfig extends IClassificationModelConfig {
    classification: IXGBClassificationConfig
}








/**
 * ConsensusModel Configuration
 * The configuration that will be use to generate and interpret predictions.
 */
export interface IConsensusModelConfig {
    /**
     * The list of KerasRegressionModel|KerasClassificationModel|XGBRegressionModel|
     * XGBClassificationModel attached to the ConsensusModel. This value is only populated 
     * when get_model is invoked
     */
    sub_models: IModel[],

    /**
     * The interpreter that will determine the prediction's result. Must represent at least 51%
     * of the provided sub models.
     */
    interpreter: IConsensusInterpreterConfig
}
 
 
 
 
 
 

 
 
 /* Model */
 
 
 
 
 
 
 
 /**
  * Model
  * The final state of a KerasRegressionModel|KerasClassificationModel|XGBRegressionModel|
  * XGBClassificationModel|ConsensusModel once an instance is initialized.
  * The type of a model can be determined based on its configuration. Existing models are:
  * 1) KerasRegressionModel: a model with a single keras_regression.
  * 2) XGBRegressionModel: a model with a single xgb_regression.
  * 3) KerasClassificationModel: a model with a single keras_classification.
  * 4) XGBClassificationModel: a model with a single xgb_classification.
  * 5) ConsensusModel: a model with any number of keras_classification|xgb_classification.
  */
 export interface IModel {
    // Identity of the Model. This value will be used by the cache system when storing/retrieving predictions.
    id: string,
 
    // KerasRegression Configurations
    keras_regressions?: IKerasRegressionModelConfig[],

    // XGBRegression Configurations
    xgb_regressions?: IXGBRegressionModelConfig[],
 
    // KerasClassification Configurations
    keras_classifications?: IKerasClassificationModelConfig[],
 
    // XGBClassification Configurations
    xgb_classifications?: IXGBClassificationModelConfig[],

    // ConsensusModel Configuration
    consensus?: IConsensusModelConfig
 } 