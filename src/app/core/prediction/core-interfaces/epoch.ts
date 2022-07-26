

/* Epoch Types at types/epoch.py */





/* Position Exit Combinations */



// Identifiers
export type IPositionExitCombinationID = 
"TP10_SL10"| "TP10_SL15"| "TP15_SL10"| "TP15_SL15"| "TP20_SL10"| "TP20_SL15"| 
"TP10_SL20"| "TP15_SL20"| "TP20_SL20"| "TP20_SL25"| "TP25_SL20"| "TP25_SL25"|
"TP25_SL30"| "TP30_SL25"| "TP20_SL30"| "TP30_SL20"| "TP30_SL30"| "TP30_SL35"|
"TP35_SL30"| "TP35_SL35"| "TP35_SL40"| "TP40_SL35"| "TP30_SL40"| "TP40_SL30"|
"TP40_SL40";


// Paths
export type IPositionExitCombinationPath = 
"01_TP10_SL10"| "02_TP10_SL15"| "03_TP15_SL10"| "04_TP15_SL15"| "05_TP20_SL10"| "06_TP20_SL15"| 
"07_TP10_SL20"| "08_TP15_SL20"| "09_TP20_SL20"| "10_TP20_SL25"| "11_TP25_SL20"| "12_TP25_SL25"|
"13_TP25_SL30"| "14_TP30_SL25"| "15_TP20_SL30"| "16_TP30_SL20"| "17_TP30_SL30"| "18_TP30_SL35"|
"19_TP35_SL30"| "20_TP35_SL35"| "21_TP35_SL40"| "22_TP40_SL35"| "23_TP30_SL40"| "24_TP40_SL30"|
"25_TP40_SL40";


// Position Exit Combination Record
export interface IPositionExitCombinationRecord {
	take_profit: number,
    stop_loss: number,
    path: IPositionExitCombinationPath
}





/* Backtest Config Factory */





/* Epoch Configuration */




/**
 * Epoch Config
 * The configuration to be used by the Epoch and influence the entire infrastructure.
 */
export interface IEpochConfig {
    // Random seed to be set on all required libraries in order to guarantee reproducibility
    seed: number,

    // Identifier, must be preffixed with "_". For example: "_EPOCHNAME"
    id: string,

    // The range of the Epoch. These values are used for:
    // 1) Calculate the training evaluation range (epoch_width * 0.15)
    // 2) Calculate the backtest range (epoch_width * 0.2)
    start: number,
    end: number,

    // The training evaluation range is used for the following:
    // 1) Backtest ArimaModels in all position exit combinations
    // 2) Evaluate freshly trained Regression Models
    // 3) Backtest shortlisted RegressionModels in all position exit combinations
    // 4) Evaluate freshly trained Classification Models
    // training_evaluation_range = epoch_width * 0.15
    training_evaluation_start: number,
    training_evaluation_end: number,

    // The backtest range is used for the following:
    // 1) Backtest shortlisted ClassificationModels
    // 2) Backtest generated ConsensusModels
    // backtest_range = epoch_width * 0.2
    backtest_start: number,
    backtest_end: number,

    // Highest and lowest price within the Epoch.
    // If the price was to go above the highest or below the lowest price, trading should be
    // stopped and a new epoch should be published once the market is "stable"
    highest_price: number,
    lowest_price: number,

    // Regression Price Change Requirement
    // This value is used to evaluate Keras & XGB Regression Models. When creating an Epoch or 
    // training a regression, the best position exit combination is unknown and therefore it 
    // may require recurrent adjustments.
    // At the time of coding this module, after having completed the Arima Backtests in the _ALPHA
    // Epoch, the Regression Selection results pointed to TP30_SL30 as the best combination.
    regression_price_change_requirement: number,

    // The number of minutes the model will remain idle when a position is closed during backtests
    idle_minutes_on_position_close: number,

    // The identifier of the classification training data for unit tests
    ut_class_training_data_id: string,

    // The Position Exit Combination that came victorious in the Regression Selection Process
    take_profit: number,
    stop_loss: number
}




// Default values to speed up the creation process
export interface IEpochDefaults {
	epoch_width: number, // Number of months that will comprise the Epoch
    seed: number,
    regression_price_change_requirement: number,
    idle_minutes_on_position_close: number
}