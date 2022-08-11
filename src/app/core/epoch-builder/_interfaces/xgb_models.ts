

/* XGBoost Model Types at types/xgb_models_types.py */






/* Configuration */




/**
 * XGB Model Configuration
 * The configuration that was used to build the XGBoost Model.
 */
export interface IXGBModelConfig {
    // The name of the XGB Model. If it doesn't exist it will raise an error.
    name: string,

    // @TODO

    /**
     * Regression Model Type
     * Default: will generate all predictions in one go.
     * Autoregressive: will generate 1 prediction at a time and feed it to itself as an input 
     */
    autoregressive?: boolean,

    /**
     * Lookback used as the model's input. This lookback is not set in the 
     * RegressionTraining.json config file. However, it is populated once the RegressionTraining
     * instance is initialized.
     * Also keep in mind that this property only exists Regressions.
     */
    lookback?: number,

    /**
     * Number of predictions the model will output. This prediction is not set in the 
     * RegressionTraining.json file. However, it is populated once the RegressionTraining
     * instance is initialized.
     * Also keep in mind that this property only exists Regressions.
     */
     predictions?: number,

     /**
      * Number of features used for the input layer of a Classification Network. This value is 
      * not set in the ClassificationTraining.json file. Instead, it is populated once the 
      * ClassificationTraining instance is initialized.
      */
    features_num?: number,
}







/* Training Configuration */



/**
 * XGB Model Training Type Configuration
 * Based on the type of training (hyperparams|shortlist), different training settings will be used.
 * For more information regarding these args, view the KerasTraining.ipynb notebook.
 */
export interface IXGBTrainingTypeConfig {
    // @TODO
    something: any
}









/* Training History */



/**
 * Training History
 * The dictionary built once the training is completed. The properties adapt accordingly 
 * based on the loss and metric functions used.
 */
export interface IXGBModelTrainingHistory {
    // @TODO
    something: number[]
}







/* Model Summary */



// Model Class Name
export type IXGBModelClassName = "Sequential";




/**
 * Model Summary
 * Extracts all the relevant information from a trained model.
 */
export interface IXGBModelSummary {
    // The name of the class used to create the model.
    model_class: IXGBModelClassName,

    // @TODO
}