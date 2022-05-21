

/* Interpreter Types at interpreter/types.py */



/**
 * Percent Change Interpreter Configuration
 * The configuration used in order to interpret the model's predictions based on the 
 * percentual change from the first to the last prediction.
 */
 export interface IPercentChangeInterpreterConfig {
    long: number,
    short: number
}





/**
 * Probability Interpreter Configuration
 * The configuration used in order to interpret the model's predictions based on the 
 * up and down probability.
 */
export interface IProbabilityInterpreterConfig {
    min_probability: number
}