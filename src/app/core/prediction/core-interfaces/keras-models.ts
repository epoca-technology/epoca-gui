

/* Keras Model Types at types/keras_models_types.py */






/* Configuration */


// Optimizer Functions
export type IKerasOptimizer = "adam"|"rmsprop";


// Loss Functions
export type IKerasLoss = "mean_absolute_error"|"mean_squared_error"|"categorical_crossentropy"|"binary_crossentropy";
export type IKerasRegressionLoss = "mean_absolute_error"|"mean_squared_error";
export type IKerasClassificationLoss = "categorical_crossentropy"|"binary_crossentropy";


// Metric Functions
export type IKerasMetric = "mean_absolute_error"|"mean_squared_error"|"categorical_accuracy"|"binary_accuracy";
export type IKerasRegressionMetric = "mean_absolute_error"|"mean_squared_error";
export type IKerasClassificationMetric = "categorical_accuracy"|"binary_accuracy";


// Activation Functions
export type IKerasActivation = "relu"|"tanh";




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
    activations?: IKerasActivation[],

    // Filters
    filters?: number[],

    // Kernel Sizes
    kernel_sizes?: number[],

    // Pool Sizes
    pool_sizes?: number[],

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
 * Keras Model Training Type Configuration
 * Based on the type of training (hyperparams|shortlist), different training settings will be used.
 * For more information regarding these args, view the KerasTraining.ipynb notebook.
 */
export interface IKerasTrainingTypeConfig {
    // The split that will be applied to the data in order to generate the train and test datasets
    train_split: number

    // A scalar float32 or float64 Tensor or a Python number. The initial learning rate.
    initial_lr: number

    // How often to apply decay.
    decay_steps: number

    // A Python number. The decay rate for the learning rate per step.
    decay_rate: number

    // The maximum number of epochs the training process will go through
    epochs: number

    // Number of epochs with no improvement after which training will be stopped.
    patience: number,

    /**
     * Number of samples per gradient update. If unspecified, batch_size will default to 32.
     * Do not specify the batch_size if your data is in the form of datasets
     */
     batch_size: number
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
    binary_accuracy?: number[],
    val_binary_accuracy?: number[],
}







/* Model Summary */



// Optimizer Name
export type IKerasOptimizerName = "Adam"|"RMSprop";


/**
 * Model Optimizer Config
 * The optimizer configuration used when the model was compiled. Keep in mind that
 * all these values are stringified to ensure compatibility with the JSON file format.
 */
export interface IKerasModelOptimizerConfig {
    name: IKerasOptimizerName,
    learning_rate: string,
    decay?: string,
    beta_1?: string,
    beta_2?: string,
    epsilon?: string,
    amsgrad?: string,
    rho?: string,
    momentum?: string,
    centered?: string,
}






/**
 * Model Loss Config
 * The loss configuration used when the model was compiled. Keep in mind that
 * all these values are stringified to ensure compatibility with the JSON file format.
 */
export interface IKerasModelLossConfig {
    name: IKerasLoss,
    reduction?: string,
    from_logits?: string,
    label_smoothing?: string,
    axis?: string,
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



// Model Class Name
export type IKerasModelClassName = "Sequential";


// Metric Names
export type IKerasMetricName = "loss"|"categorical_accuracy"|"binary_accuracy";



/**
 * Model Summary
 * Extracts all the relevant information from a trained model.
 */
export interface IKerasModelSummary {
    // The name of the class used to create the model.
    model_class: IKerasModelClassName,

    // Optimizer Config
    optimizer_config: IKerasModelOptimizerConfig,

    // Loss Config
    loss_config: IKerasModelLossConfig,

    // Metrics
    metrics: IKerasMetricName[],

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