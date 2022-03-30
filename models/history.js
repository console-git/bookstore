const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bookHistorySchema = new Schema({
    userId: Number,
    rentId: Number, //unique
    bookId: Number,
    rentDate: String,
    returnDate: String
    // bookRent: [
    //     {
    //         bookId: Number,
    //         amount: Number,
    //         rentDate:String,
    //         returnDate:String
    //     }
    // ],
},
    {
        timestamps: {
            createdAt: "createdAt",
        },
    })

const bookHistoryModel = mongoose.model('rent', bookHistorySchema)

module.exports = bookHistoryModel
