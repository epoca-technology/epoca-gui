import { IModel, IPrediction } from "./model";





/* Backtest Types at types/backtest_types.py */





/* Position */



/**
 * Position type
 * A position type can only be one of the following:
 *  1: Long
 * -1: Short
 */
 export type IPositionType = 1|-1;




 /**
  * Position Record
  * When a position is closed, it is saved in a list that can be reviewed in the GUI when
  * the backtest completes.
  */
 export interface IBacktestPosition {
     // Type of position: 1 = long, -1 = short
     t: IPositionType,
 
     // Prediction
     p: IPrediction,
 
     // Position Times
     ot: number, // Open Timestamp
     ct: number, // Close Timestamp - Populated when the position is closed
 
     // Position Prices
     op: number,     // Open Price
     tpp: number,    // Take Profit Price
     slp: number,    // Stop Loss Price
 
     /**
      * Close Price: This property is populated when a position is closed. It will
      * take value of the Take Profit Price or Stop Loss Price depending on the outcome.
      */
     cp: number,
 
     /**
      * The outcome is populated once the position is closed. True for successful and False
      * for unsuccessful
      */
     o: boolean,
 
     // Points when the position is closed
     pts: number
 }
 
 
 
 
 /**
  * Performance
  * Once a model has finished the testing process it builds a performance dict 
  * containing all the details.
  */
 export interface IBacktestPerformance {
     // Points
     points: number,         // Total Points Accumulated
     points_hist: number[],  // Historical fluctuation of points
 
     // Positions List
     positions: IBacktestPosition[],
 
     // Counts
     long_num: number,
     short_num: number,
 
     // Accuracy
     long_acc: number,
     short_acc: number,
     general_acc: number
 }
 
 
 
 
 
 
 
 /* Backtest */
 



 /**
  * Backtest Identifier
  * In order to automate several processes, Backtest IDs should be recognizable on a
  * file system level. Eventhough the type appears strict, the system should be able to
  * handle any string as an ID.
  */
export type IBacktestID = 
// Unit Test
"unit_test"|

// Arima Backtests
"arima_1"| "arima_2"| "arima_3"| "arima_4"| "arima_5"| "arima_6"| "arima_7"| "arima_8"| "arima_9"|

// Keras Regression Backtests
"keras_regression"|

// XGBoost Regression Backtests
"xgb_regression"|

// Keras Classification Backtests
"keras_classification"|

// XGBoost Classification Backtests
"xgb_classification"|

// Final Shortlist - Includes best classification and consensus models
"final";



 
 
 /**
  * Backtest Configuration
  * A backtest instance can be initialized with the following configuration. Different
  * configurations can be spread among multiple backtest instances.
  */
 export interface IBacktestConfig {
     // Identification
     id: IBacktestID,
 
     // Description of the backtest (purpose)
     description: string,
 
     // Postitions Take Profit & Stop Loss
     take_profit: number,
     stop_loss: number,
 
     // The number of minutes the model will remain idle after closing a position
     idle_minutes_on_position_close: number,
 
     // The list of Model Instances that will be put through the backtesting process
     models: IModel[]
 }
 
 
 
 
 /**
  * Backtest
  * The backtest configuration which is inserted into each of the Model Backtest Results.
  */
 export interface IBacktest {
     // Identification
     id: string,
 
     // Description of the backtest (purpose)
     description: string,
 
     // Start and end time
     start: number, // The first candlestick's open time
     end: number,   // The last candlestick's close time
 
     // Postitions Take Profit & Stop Loss
     take_profit: number,
     stop_loss: number,
 
     // The number of minutes the model will remain idle after closing a position
     idle_minutes_on_position_close: number,
 
     // Model Backtesting Timing
     model_start: number,
     model_end: number,
     model_duration: number,
 }
 
 
 
 
 
 
 /**
  * Model Backtest Result
  * These results are saved by model. The result file which is generated at the end
  * of the execution, contains a List[IBacktestResult]
  */
 export interface IBacktestResult {
     backtest: IBacktest,
     model: IModel,
     performance: IBacktestPerformance
 }