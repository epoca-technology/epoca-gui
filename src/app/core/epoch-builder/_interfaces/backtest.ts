import { IEpochBuilderPositionPerformance } from "./position"
import { IModel } from "./model";





/* Backtest Types at types/backtest_types.py */





 
 


 /**
  * Backtest Identifier
  * In order to automate several processes, Backtest IDs should be recognizable on a
  * file system level. Eventhough the type appears strict, the system should be able to
  * handle any string as an ID.
  */
export type IBacktestID = 
// Unit Test
"unit_test"|

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
     model_end: number
 }
 
 
 
 
 
 
 /**
  * Model Backtest Result
  * These results are saved by model. The result file which is generated at the end
  * of the execution, contains a List[IBacktestResult]
  */
 export interface IBacktestResult {
     backtest: IBacktest,
     model: IModel,
     performance: IEpochBuilderPositionPerformance
 }