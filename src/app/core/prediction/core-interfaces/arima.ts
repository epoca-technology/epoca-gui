

/* Arima Types at types/arima_types.py */



 /**
  * Arima Config
  * The configuration to be used on the Arima Instance to generate predictions.
  */
  export interface IArimaConfig {
    /**
     * p is the order (number of time lags) of the autoregressive model
     * d is the degree of differencing (the number of times the data have had past values subtracted)
     * q is the order of the moving-average model.
     */
    p: number,
    d: number,
    q: number,

    /**
     * P, D, Q refer to the autoregressive, differencing, and moving average terms for the 
     * seasonal part of the ARIMA model.
     */
     P: number,
     D: number,
     Q: number,

     // m refers to the number of periods in each season
     m: number
}