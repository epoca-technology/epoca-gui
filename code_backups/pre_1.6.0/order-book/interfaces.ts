


export interface IOrderBookService {
    getBook(): Promise<IOrderBook|undefined>
}






// Order Book Item (Bid or Ask)
export interface IOrderBookItem {
    price: number,
    quantity: number,

    // GUI Specific property, it is populated when the order book is loaded/updated
    percent: number
}




// Order Book
export interface IOrderBook {
    // The timestamp in which the book was last updated
    last_update: number,

    // The bid that should be taken in case of selling
    safe_bid: number,

    // The ask that should be taken in case of buying
    safe_ask: number,

    // The list of grouped bids
    bids: Array<IOrderBookItem>,

    // The list of grouped asks
    asks: Array<IOrderBookItem>
}