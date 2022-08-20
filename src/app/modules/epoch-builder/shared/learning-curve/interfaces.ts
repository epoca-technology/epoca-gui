


export interface ILearningCurveComponent {

}




export interface ILearningCurve {
    name: string,
    type: "loss"|"accuracy",
    train: number[],
    val: number[]
}