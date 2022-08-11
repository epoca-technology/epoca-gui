import { IPrediction } from "./prediction";



/* Position Types at types/position_types.py */





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
 export interface IEpochBuilderPosition {
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
 export interface IEpochBuilderPositionPerformance {
     // Points
     points: number,           // Total Points Accumulated
     points_hist: number[],    // Historical fluctuation of points
     points_median: number,  // The median of the points collected during the backtest
 
     // Positions List
     positions: IEpochBuilderPosition[],
 
     // Counts
     long_num: number,
     short_num: number,

     // Outcome Counts
     long_outcome_num: number,
     short_outcome_num: number,
 
     // Accuracy
     long_acc: number,
     short_acc: number,
     general_acc: number
 }