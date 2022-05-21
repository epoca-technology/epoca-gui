

/* Keras Model Types at keras_models/types.py */






/* Configuration */



/**
 * Keras Model Configuration
 * The configuration that was used to build the Keras Model.
 */
export interface IKerasModelConfig {
    // The name of the Keras Model. If it doesn't exist it will raise an error.
    name: string,

    // Units
    units?: number[],

    // Dropout rates
    dropout_rates?: number[],

    // Activations
    activations?: string[],

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
     predictions?: number
}








/* Training History */



/**
 * Training History
 * The dictionary built once the training is completed. The properties adapt accordingly 
 * based on the loss and metric functions used.
 */
export interface IKerasModelTrainingHistory {
    // Training and validation loss
    loss: number[],
    val_loss: number[],

    // Regression Values
    mean_absolute_error?: number[],
    val_mean_absolute_error?: number[],
    mean_squared_error?: number[],
    val_mean_squared_error?: number[],

    // Classification Values
    categorical_accuracy?: number[],
    val_categorical_accuracy?: number[],
}







/* Model Summary */



/**
 * Model Optimizer Config
 * The optimizer configuration used when the model was compiled. Keep in mind that
 * all these values are stringified to ensure compatibility with the JSON file format.
 */
export interface IKerasModelOptimizerConfig {
    name: string,
    learning_rate: string,
    decay?: string,
    beta_1?: string,
    beta_2?: string,
    epsilon?: string,
    amsgrad?: string,
}




/**
 * Model Loss Config
 * The loss configuration used when the model was compiled. Keep in mind that
 * all these values are stringified to ensure compatibility with the JSON file format.
 */
export interface IKerasModelLossConfig {
    name: string,
    reduction?: string
}



/**
 * Model Layer
 * A layer stacked with other layers within the model.
 */
export interface IKerasModelLayer {
    name: string,
    params: number,
    input_shape: Array<number|null>,
    output_shape: Array<number|null>,
    trainable: boolean,
}





/**
 * Model Summary
 * Extracts all the relevant information from a trained model.
 */
export interface IKerasModelSummary {
    // The name of the class used to create the model.
    model_class: string,

    // Optimizer Config
    optimizer_config: IKerasModelOptimizerConfig,

    // Loss Config
    loss_config: IKerasModelLossConfig,

    // Metrics
    metrics: string[],

    // Input and output shapes
    input_shape: Array<number|null>,
    output_shape: Array<number|null>,

    // Layers
    layers: IKerasModelLayer[],

    // Params
    total_params: number
    trainable_params: number
    non_trainable_params: number
}