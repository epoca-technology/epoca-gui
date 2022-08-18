

// Component
export interface IKerasHyperparamsViewComponent {

}


// Counters
export interface IKerasHyperparamsCounter {
    [hyperparamName: string]: number
}


// Learning rate values
export type IKerasHyperparamsLearningRate = "-1"|"0.001";


// The names of the supported neural networks
export type IKerasHyperparamsNetworkType = "DNN"|"CNN"|"LSTM"|"CLSTM"|"Unknown";


// The series of a network. The "S" represents the depth of the neural network
export type IKerasHyperparamsNetworkSeries = "S2"|"S3"|"S4"|"S5"|"Unknown";



